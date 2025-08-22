import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import { embeddings } from "@/helper/embeddings";


export interface PageMetadata {
  source: string;   // e.g. "url", "pdf"
  title: string;    // Page title
  url: string;      // Original page URL
}

export interface ChunkedDocument {
  pageContent: string; 
  metadata: PageMetadata & {
    chunkIndex: number; 
    totalChunks: number;
  };
}

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const visited = new Set<string>();
  const queue: string[] = [url];
  const results: Document[] = [];

  const maxPages = 20;
  const baseHost = new URL(url).host;

  async function scrapePage(current: string) {
    const { data } = await axios.get(current, { timeout: 30000 });
    const $ = cheerio.load(data);
    $("script, style, noscript").remove();
    const text = $("body").text().replace(/\s+/g, " ").trim();

    return new Document({
      pageContent: text,
      metadata: { source: "url", title: $("title").text() || current, url: current },
    });
  }

  while (queue.length && results.length < maxPages) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    try {
      const doc = await scrapePage(current);
      results.push(doc);

      const { data } = await axios.get(current, { timeout: 10000 });
      const $ = cheerio.load(data);

      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;
        try {
          const abs = new URL(href, current).toString();
          const absHost = new URL(abs).host;

          // Skip unwanted file types
          const blockedExt = /\.(pdf|jpg|jpeg|png|gif|svg|webp|mp4|mp3|zip|rar|docx?)$/i;
          if (blockedExt.test(abs)) return;

          if (
            absHost === baseHost &&
            !visited.has(abs) &&
            results.length + queue.length < maxPages
          ) {
            queue.push(abs);
          }
        } catch {
          // Ignore invalid URLs
        }
      });
    } catch (e) {
      console.error("Failed to scrape:", current, e);
    }
  }

  // Split into chunks
  const splitter = new CharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const out: ChunkedDocument[] = [];

  for (const d of results) {
    const chunks = await splitter.splitText(d.pageContent);
    const totalChunks = chunks.length;

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];
      out.push({
        pageContent: chunk,
        metadata: {
          ...(d.metadata as PageMetadata),
          chunkIndex,
          totalChunks,
        },
      });
    }
  }

  // Qdrant setup
  if (!process.env.END_POINT || !process.env.QDRANT_API_KEY) {
    return NextResponse.json({ error: "Missing Qdrant config" }, { status: 500 });
  }

  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.END_POINT,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: "langchainjs-testing",
  });

  await vectorStore.addDocuments(
    out.map(
      (d) =>
        new Document({
          pageContent: d.pageContent,
          metadata: d.metadata,
        })
    )
  );

  return NextResponse.json({
    success: true,
    pages: results.length,
    chunks: out.length,
  });
}
