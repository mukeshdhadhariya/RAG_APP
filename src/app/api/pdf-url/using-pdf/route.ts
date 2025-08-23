// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { CharacterTextSplitter } from "@langchain/textsplitters";
// import { QdrantVectorStore } from "@langchain/qdrant";
// import { embeddings } from "@/helper/embeddings";
// import { NextRequest, NextResponse } from "next/server";


// export const runtime = "nodejs";
// export async function POST(req:NextRequest){
//     try {
//         const formData = await req.formData();
//         const file = formData.get("file") as File | null;

//         if (!file) {
//           return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//         }
     

//         const loader = new PDFLoader(file);
//         const docs = await loader.load();
//         if (!docs.length) {
//           return NextResponse.json(
//             { error: "No documents found in PDF" },
//             { status: 400 }
//           );
//         }


//         const splitter = new CharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
//         const docsChunks = await splitter.splitDocuments(docs);


//         const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
//             url: process.env.END_POINT,
//             apiKey:process.env.QDRANT_API_KEY,
//             collectionName: "langchainjs-testing",
//         });

//         await vectorStore.addDocuments(docsChunks)

        
//         return NextResponse.json({
//           success:true,
//           message:"chunks uploaded "
//         },{
//           status:200
//         })

//     }catch(err){
//       return NextResponse.json({
//         success:false,
//         message:"chunks failed to load"
//       },{
//         status:400
//       })
//     }
// }


import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "@/helper/embeddings";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const loader = new PDFLoader(new Blob([bytes]));
    // const loader = new PDFLoader(file);
    const docs = await loader.load();
    
    if (!docs.length) {
      return NextResponse.json(
        { error: "No documents found in PDF" },
        { status: 400 }
      );
    }

    const splitter = new CharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const docsChunks = await splitter.splitDocuments(docs);

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.END_POINT,
        apiKey: process.env.QDRANT_API_KEY,
        collectionName: "langchainjs-testing",
      }
    );

    await vectorStore.addDocuments(docsChunks);

    return NextResponse.json(
      {
        success: true,
        message: "Chunks uploaded successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing PDF:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process and upload PDF chunks",
        error: process.env.NODE_ENV === "development" ? error: undefined,
      },
      {
        status: 500,
      }
    );
  }
}