import { Document } from "@langchain/core/documents";

type ElasticChunkMetadata = Record<string, unknown> & {
  title?: string;
  url?: string;
  source?: string;
  chunkIndex?: number;
  totalChunks?: number;
};

export interface ElasticChunkHit {
  document: Document;
  score: number;
}

interface ElasticSearchHit {
  _id: string;
  _score?: number | null;
  _source?: {
    content?: string;
    metadata?: ElasticChunkMetadata;
  };
}

function getElasticConfig() {
  const elasticUrl =
    process.env.ELASTICSEARCH_URL ?? process.env.ELASTIC_URL ?? "http://localhost:9200";
  const indexName = process.env.ELASTICSEARCH_INDEX ?? "langchainjs-chunks";

  return {
    elasticUrl: elasticUrl.replace(/\/+$/, ""),
    indexName,
  };
}

function getElasticHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (process.env.ELASTICSEARCH_API_KEY) {
    headers.Authorization = `ApiKey ${process.env.ELASTICSEARCH_API_KEY}`;
    return headers;
  }

  if (process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD) {
    const token = Buffer.from(
      `${process.env.ELASTICSEARCH_USERNAME}:${process.env.ELASTICSEARCH_PASSWORD}`
    ).toString("base64");
    headers.Authorization = `Basic ${token}`;
  }

  return headers;
}

async function elasticRequest(path: string, init?: RequestInit) {
  const { elasticUrl } = getElasticConfig();
  const response = await fetch(`${elasticUrl}${path}`, {
    ...init,
    headers: {
      ...getElasticHeaders(),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Elasticsearch request failed (${response.status}): ${body}`);
  }

  return response;
}

export async function ensureElasticIndex() {
  const { indexName } = getElasticConfig();

  const existing = await fetch(`${getElasticConfig().elasticUrl}/${encodeURIComponent(indexName)}`, {
    method: "HEAD",
    headers: getElasticHeaders(),
  });

  if (existing.ok) {
    return;
  }

  const response = await fetch(`${getElasticConfig().elasticUrl}/${encodeURIComponent(indexName)}`, {
    method: "PUT",
    headers: getElasticHeaders(),
    body: JSON.stringify({
      settings: {
        analysis: {
          analyzer: {
            default: {
              type: "standard",
            },
          },
        },
      },
      mappings: {
        properties: {
          content: { type: "text" },
          metadata: {
            properties: {
              title: { type: "text" },
              url: { type: "keyword" },
              source: { type: "keyword" },
              chunkIndex: { type: "integer" },
              totalChunks: { type: "integer" },
            },
          },
        },
      },
    }),
  });

  if (response.ok) {
    return;
  }

  const payload = await response.json().catch(() => null);
  if (payload?.error?.type === "resource_already_exists_exception") {
    return;
  }

  throw new Error(`Failed to ensure Elasticsearch index: ${JSON.stringify(payload ?? {})}`);
}

export async function indexDocumentsInElastic(documents: Document[]) {
  if (!documents.length) {
    return;
  }

  const { indexName } = getElasticConfig();
  await ensureElasticIndex();

  const bulkBody = documents
    .flatMap((document, index) => {
      const metadata = (document.metadata ?? {}) as ElasticChunkMetadata;
      return [
        { index: { _index: indexName, _id: `${metadata.url ?? metadata.title ?? "doc"}-${metadata.chunkIndex ?? index}` } },
        {
          content: document.pageContent,
          metadata: {
            title: metadata.title ?? null,
            url: metadata.url ?? null,
            source: metadata.source ?? null,
            chunkIndex: metadata.chunkIndex ?? index,
            totalChunks: metadata.totalChunks ?? documents.length,
          },
        },
      ];
    })
    .map((item) => JSON.stringify(item))
    .join("\n")
    .concat("\n");

  const response = await elasticRequest(`/_bulk`, {
    method: "POST",
    body: bulkBody,
    headers: {
      "Content-Type": "application/x-ndjson",
    },
  });

  const result = (await response.json()) as { errors?: boolean };
  if (result.errors) {
    throw new Error("Elasticsearch bulk indexing completed with errors");
  }
}

export async function searchDocumentsInElastic(query: string, size = 8) {
  const { indexName } = getElasticConfig();
  await ensureElasticIndex();

  const response = await elasticRequest(`/${encodeURIComponent(indexName)}/_search`, {
    method: "POST",
    body: JSON.stringify({
      size,
      query: {
        multi_match: {
          query,
          fields: ["content^3", "metadata.title^2", "metadata.source", "metadata.url"],
          type: "best_fields",
        },
      },
    }),
  });

  const payload = (await response.json()) as { hits?: { hits?: ElasticSearchHit[] } };
  return (payload.hits?.hits ?? []).map((hit) => {
    const source = hit._source ?? {};
    const metadata = source.metadata ?? {};

    return {
      document: new Document({
        pageContent: source.content ?? "",
        metadata,
      }),
      score: hit._score ?? 0,
    } satisfies ElasticChunkHit;
  });
}
