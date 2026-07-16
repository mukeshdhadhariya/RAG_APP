// // import { QdrantVectorStore } from "@langchain/qdrant";
// // import { embeddings } from "@/helper/embeddings";
// // import { NextRequest, NextResponse } from "next/server";
// // import { GoogleGenAI } from "@google/genai";
  

// // const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// // export async function GET(req: NextRequest) {
// //   try {
// //     const { searchParams } = new URL(req.url);
// //     const UserQurey : any= searchParams.get("input");

// //     // connect to Qdrant
// //     const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
// //       url: process.env.END_POINT,
// //       apiKey: process.env.QDRANT_API_KEY,
// //       collectionName: "langchainjs-testing",
// //     });

// //     const ret = vectorStore.asRetriever({ k: 2 });
// //     const result = await ret.invoke(UserQurey);

// //     const SYSTEM_PROMPT = `You are a helpful AI assistant. 
// //     Always answer the user query based ONLY on the provided PDF context. 
// //     Context: ${JSON.stringify(result)} 

// //     Guidelines:
// //     - Give short but detailed answers (concise sentences, no unnecessary words).  
// //     - If the answer is not present in the context, say clearly: "The answer is not available in the provided PDF." 
// //     - Never make up information outside the context.`;

// //     const chatResult  = await ai.models.generateContent({
// //       model: "gemini-2.5-flash",
// //       contents: [
// //         { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\nUser: " + UserQurey }] }
// //       ],

// //     });

// //     const sources = result.map((d) => ({
// //     title: d.metadata?.title || d.metadata?.url || d.metadata?.source || "Source",
// //     url: d.metadata?.url || null,
// //     }));

// //     return NextResponse.json({
// //       success: true,
// //       data:sources,
// //       message: chatResult.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response from model"
// //     });

// //   } catch (error: any) {
// //     console.error("Error in GET /api/retriver-data:", error);
// //     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
// //   }
// // }


// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { QdrantVectorStore } from "@langchain/qdrant";
// import { embeddings } from "@/helper/embeddings";
// import { NextRequest, NextResponse } from "next/server";
// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const userQuery = searchParams.get("input") as string | null;

//     if (!userQuery) {
//       return NextResponse.json(
//         { success: false, error: "Missing 'input' query parameter" },
//         { status: 400 }
//       );
//     }

//     // connect to Qdrant
//     const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
//       url: process.env.END_POINT,
//       apiKey: process.env.QDRANT_API_KEY,
//       collectionName: "langchainjs-testing",
//     });

//     const retriever = vectorStore.asRetriever({ k: 2 });
//     const result = await retriever.invoke(userQuery);

//     const SYSTEM_PROMPT = `You are a helpful AI assistant. 
//     Always answer the user query based ONLY on the provided PDF context. 
//     Context: ${JSON.stringify(result)} 

//     Guidelines:
//     - Give short but detailed answers (concise sentences, no unnecessary words).  
//     - If the answer is not present in the context, say clearly: "The answer is not available in the provided PDF." 
//     - Never make up information outside the context.`;

//     const llm = new ChatGoogleGenerativeAI({
//       model: "gemini-2.5-flash",
//       apiKey:process.env.GOOGLE_API_KEY,
//       temperature: 0.2
//     });

//       const chatResult = llm.invoke([{ 
//         role: "user" as const, 
//         content: `${SYSTEM_PROMPT}\n\nUser: ${userQuery}`
//       }]);

//     // const chatResult = await ai.models.generateContent({
//     //   model: "gemini-2.5-flash",
//     //   contents: [
//     //     {
//     //       role: "user",
//     //       parts: [{ text: `${SYSTEM_PROMPT}\n\nUser: ${userQuery}` }],
//     //     },
//     //   ],
//     // });

//     // typing for sources
    

//     const sources = result.map((d: { metadata?: Record<string, unknown> }) => ({
//       title:
//         (d.metadata?.title as string) ||
//         (d.metadata?.url as string) ||
//         (d.metadata?.source as string) ||
//         "Source",
//       url: (d.metadata?.url as string) || null,
//     }));

//     return NextResponse.json({
//       success: true,
//       data: sources,
//       message:
//         chatResult.candidates?.[0]?.content?.parts?.[0]?.text ??
//         "No response from model",
//     });
//   } catch (error) {
//     console.error("Error in GET /api/retriver-data:", error);
//     const errMessage =
//       error instanceof Error ? error.message : "Unknown server error";
//     return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
//   }
// }



// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { QdrantVectorStore } from "@langchain/qdrant";
// import { embeddings } from "@/helper/embeddings";
// import { NextRequest, NextResponse } from "next/server";


// export const runtime = "nodejs";
// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const userQuery = searchParams.get("input");

//     if (!userQuery) {
//       return NextResponse.json(
//         { success: false, error: "Missing 'input' query parameter" },
//         { status: 400 }
//       );
//     }

//     // Connect to Qdrant
//     const vectorStore = await QdrantVectorStore.fromExistingCollection(
//       embeddings,
//       {
//         url: process.env.END_POINT,
//         apiKey: process.env.QDRANT_API_KEY,
//         collectionName: "langchainjs-testing",
//       }
//     );

//     const retriever = vectorStore.asRetriever({ k: 2 });
//     const result = await retriever.invoke(userQuery);

//     const SYSTEM_PROMPT = `You are a helpful AI assistant. 
// Always answer the user query based ONLY on the provided PDF context. 
// Context: ${JSON.stringify(result)} 

// Guidelines:
// - Give short but detailed answers (concise sentences, no unnecessary words).  
// - If the answer is not present in the context, say clearly: "The answer is not available in the provided PDF." 
// - Never make up information outside the context.`;

//     // Use LangChain’s Chat wrapper
//     const llm = new ChatGoogleGenerativeAI({
//       model: "gemini-2.5-flash",
//       apiKey: process.env.GOOGLE_API_KEY,
//       temperature: 0.2,
//     });

//     const chatResult = await llm.invoke([
//       {
//         role: "user",
//         content: `${SYSTEM_PROMPT}\n\nUser: ${userQuery}`,
//       },
//     ]);

//     // Extract text safely
//     const responseText =
//       typeof chatResult.content === "string"
//         ? chatResult.content
//         : Array.isArray(chatResult.content)
//         ? chatResult.content.map((c: any) => c.text).join(" ")
//         : "No response from model";

//     // Extract sources
//     const sources = result.map((d: any) => ({
//       title:
//         d.metadata?.title ||
//         d.metadata?.url ||
//         d.metadata?.source ||
//         "Source",
//       url: d.metadata?.url || null,
//     }));

//     return NextResponse.json({
//       success: true,
//       data: sources,
//       message: responseText,
//     });
//   } catch (error) {
//     console.error("Error in GET /api/retriver-data:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: error instanceof Error ? error.message : "Unknown server error",
//       },
//       { status: 500 }
//     );
//   }
// }




import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "@/helper/embeddings";
import { createQdrantClient } from "@/helper/qdrant";
import { searchDocumentsInElastic } from "@/helper/elasticsearch";
import { NextRequest, NextResponse } from "next/server";
import { Document } from "@langchain/core/documents";

// Define interfaces for type safety
interface DocumentMetadata {
  title?: string;
  url?: string;
  source?: string;
  [key: string]: unknown; // Allow for other metadata properties
}

interface RetrievedDocument extends Document {
  metadata: DocumentMetadata;
}

interface SourceInfo {
  title: string;
  url: string | null;
}

interface ChatContentBlock {
  text?: string;
  [key: string]: unknown;
}

interface RetrievalCandidate {
  document: RetrievedDocument;
  vectorScore: number;
  bm25Score: number;
}

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userQuery = searchParams.get("input");

    if (!userQuery) {
      return NextResponse.json(
        { success: false, error: "Missing 'input' query parameter" },
        { status: 400 }
      );
    }

    // Connect to Qdrant
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        client: createQdrantClient(),
        collectionName: "langchainjs-testing",
      }
    );

    const [vectorResults, bm25Results] = await Promise.all([
      vectorStore.similaritySearchWithScore(userQuery, 6),
      searchDocumentsInElastic(userQuery, 8),
    ]);

    const result = rerankRetrievalCandidates(userQuery, vectorResults, bm25Results, 4);

    const SYSTEM_PROMPT = `You are a helpful AI assistant. 
Always answer the user query based ONLY on the provided PDF context. 
Context: ${JSON.stringify(result)} 

Guidelines:
- Give short but detailed answers (concise sentences, no unnecessary words).  
- If the answer is not present in the context, say clearly: "The answer is not available in the provided PDF." 
- Never make up information outside the context.`;

    // Use LangChain's Chat wrapper
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: process.env.GOOGLE_API_KEY,
      temperature: 0.2,
    });

    const chatResult = await llm.invoke([
      {
        role: "user",
        content: `${SYSTEM_PROMPT}\n\nUser: ${userQuery}`,
      },
    ]);

    // Extract text safely with proper typing
    const responseText = extractResponseText(chatResult.content);

    // Extract sources with proper typing
    const sources: SourceInfo[] = result.map((d: RetrievedDocument) => ({
      title:
        d.metadata?.title ||
        d.metadata?.url ||
        d.metadata?.source ||
        "Source",
      url: d.metadata?.url || null,
    }));

    return NextResponse.json({
      success: true,
      data: sources,
      message: responseText,
    });
  } catch (error) {
    console.error("Error in GET /api/retriver-data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}

// Helper function to extract response text with proper typing
function extractResponseText(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }
  
  if (Array.isArray(content)) {
    return content
      .map((block: unknown) => {
        if (typeof block === "object" && block !== null && "text" in block) {
          return (block as ChatContentBlock).text || "";
        }
        return "";
      })
      .join(" ")
      .trim();
  }
  
  return "No response from model";
}

function rerankRetrievalCandidates(
  query: string,
  vectorResults: [Document, number][],
  bm25Results: { document: Document; score: number }[],
  limit: number
) {
  const queryTokens = tokenizeQuery(query);
  const maxVectorScore = Math.max(...vectorResults.map(([, score]) => score), 1);
  const maxBm25Score = Math.max(...bm25Results.map((item) => item.score), 1);

  const candidateMap = new Map<string, RetrievalCandidate>();

  for (const [document, score] of vectorResults) {
    const fingerprint = getDocumentFingerprint(document);
    candidateMap.set(fingerprint, {
      document: document as RetrievedDocument,
      vectorScore: score,
      bm25Score: candidateMap.get(fingerprint)?.bm25Score ?? 0,
    });
  }

  for (const item of bm25Results) {
    const fingerprint = getDocumentFingerprint(item.document);
    const existing = candidateMap.get(fingerprint);
    candidateMap.set(fingerprint, {
      document: item.document as RetrievedDocument,
      vectorScore: existing?.vectorScore ?? 0,
      bm25Score: item.score,
    });
  }

  return [...candidateMap.values()]
    .map((candidate) => {
      const content = candidate.document.pageContent ?? "";
      const metadata = candidate.document.metadata ?? {};
      const lexicalScore = scoreLexicalOverlap(queryTokens, content, metadata);
      const normalizedVectorScore = candidate.vectorScore / maxVectorScore;
      const normalizedBm25Score = candidate.bm25Score / maxBm25Score;

      return {
        ...candidate.document,
        metadata: {
          ...metadata,
          vectorScore: candidate.vectorScore,
          bm25Score: candidate.bm25Score,
          rerankScore:
            normalizedBm25Score * 0.55 + normalizedVectorScore * 0.35 + lexicalScore * 0.1,
        },
      } as RetrievedDocument;
    })
    .sort((left, right) => {
      const leftScore = Number(left.metadata?.rerankScore ?? 0);
      const rightScore = Number(right.metadata?.rerankScore ?? 0);
      return rightScore - leftScore;
    })
    .slice(0, limit);
}

function getDocumentFingerprint(document: Document) {
  const metadata = (document.metadata ?? {}) as Record<string, unknown>;
  return [document.pageContent, metadata.url ?? metadata.title ?? metadata.source ?? ""]
    .join("::")
    .trim();
}

function tokenizeQuery(query: string) {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function scoreLexicalOverlap(
  queryTokens: string[],
  content: string,
  metadata: Record<string, unknown>
) {
  if (!queryTokens.length) {
    return 0;
  }

  const haystack = `${content} ${metadata.title ?? ""} ${metadata.source ?? ""} ${metadata.url ?? ""}`.toLowerCase();
  const matches = queryTokens.filter((token) => haystack.includes(token)).length;
  return matches / queryTokens.length;
}

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "your",
  "what",
  "about",
  "into",
  "then",
  "when",
  "where",
  "how",
  "why",
  "can",
  "you",
  "are",
  "was",
  "were",
  "have",
  "has",
  "had",
]);