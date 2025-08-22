// import { QdrantVectorStore } from "@langchain/qdrant";
// import { embeddings } from "@/helper/embeddings";
// import { NextRequest, NextResponse } from "next/server";
// import { GoogleGenAI } from "@google/genai";
  

// const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const UserQurey : any= searchParams.get("input");

//     // connect to Qdrant
//     const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
//       url: process.env.END_POINT,
//       apiKey: process.env.QDRANT_API_KEY,
//       collectionName: "langchainjs-testing",
//     });

//     const ret = vectorStore.asRetriever({ k: 2 });
//     const result = await ret.invoke(UserQurey);

//     const SYSTEM_PROMPT = `You are a helpful AI assistant. 
//     Always answer the user query based ONLY on the provided PDF context. 
//     Context: ${JSON.stringify(result)} 

//     Guidelines:
//     - Give short but detailed answers (concise sentences, no unnecessary words).  
//     - If the answer is not present in the context, say clearly: "The answer is not available in the provided PDF." 
//     - Never make up information outside the context.`;

//     const chatResult  = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: [
//         { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\nUser: " + UserQurey }] }
//       ],

//     });

//     const sources = result.map((d) => ({
//     title: d.metadata?.title || d.metadata?.url || d.metadata?.source || "Source",
//     url: d.metadata?.url || null,
//     }));

//     return NextResponse.json({
//       success: true,
//       data:sources,
//       message: chatResult.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response from model"
//     });

//   } catch (error: any) {
//     console.error("Error in GET /api/retriver-data:", error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }



import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "@/helper/embeddings";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userQuery = searchParams.get("input") as string | null;

    if (!userQuery) {
      return NextResponse.json(
        { success: false, error: "Missing 'input' query parameter" },
        { status: 400 }
      );
    }

    // connect to Qdrant
    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: process.env.END_POINT,
      apiKey: process.env.QDRANT_API_KEY,
      collectionName: "langchainjs-testing",
    });

    const retriever = vectorStore.asRetriever({ k: 2 });
    const result = await retriever.invoke(userQuery);

    const SYSTEM_PROMPT = `You are a helpful AI assistant. 
    Always answer the user query based ONLY on the provided PDF context. 
    Context: ${JSON.stringify(result)} 

    Guidelines:
    - Give short but detailed answers (concise sentences, no unnecessary words).  
    - If the answer is not present in the context, say clearly: "The answer is not available in the provided PDF." 
    - Never make up information outside the context.`;

    const chatResult = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\nUser: ${userQuery}` }],
        },
      ],
    });

    // typing for sources
    const sources = result.map((d: { metadata?: Record<string, unknown> }) => ({
      title:
        (d.metadata?.title as string) ||
        (d.metadata?.url as string) ||
        (d.metadata?.source as string) ||
        "Source",
      url: (d.metadata?.url as string) || null,
    }));

    return NextResponse.json({
      success: true,
      data: sources,
      message:
        chatResult.candidates?.[0]?.content?.parts?.[0]?.text ??
        "No response from model",
    });
  } catch (error) {
    console.error("Error in GET /api/retriver-data:", error);
    const errMessage =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
