import { QdrantClient } from "@qdrant/js-client-rest";

export function createQdrantClient() {
  return new QdrantClient({
    url: process.env.END_POINT,
    apiKey: process.env.QDRANT_API_KEY,
    checkCompatibility: false,
  });
}