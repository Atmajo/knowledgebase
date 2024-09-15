import {
  Pinecone,
  PineconeRecord,
  RecordMetadata,
} from "@pinecone-database/pinecone";
import {
  FeatureExtractionPipeline,
  mean_pooling,
  pipeline,
} from "@xenova/transformers";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { batchsize } from "./config";

export async function updateVectorDB(
  client: Pinecone,
  indexname: string,
  namespace: string,
  docs: Document[],
  progressCallback: (
    filename: string,
    totalChunks: number,
    chunksUpserted: number,
    isCompleted: boolean
  ) => void
) {
  const modelname = "mixedbread-ai/mxbai-embed-large-v1";
  const extractor = await pipeline("feature-extraction", modelname, {
    quantized: false,
  });

  for (const doc of docs) {
    await processDocument(client, indexname, namespace, doc, extractor);
  }
}

async function processDocument(
  client: Pinecone,
  indexname: string,
  namespace: string,
  doc: Document<Record<string, any>>,
  extractor: FeatureExtractionPipeline
) {
  const splitter = new RecursiveCharacterTextSplitter();

  const documentChunks = await splitter.splitText(doc.pageContent);

  const filename = getFilename(doc.metadata.source);

  // console.log(filename);
  // console.log(documentChunks.slice(0, batchsize));

  let chunkBatchIndex = 0;
  while (documentChunks.length > 0) {
    chunkBatchIndex++;
    const chunkBatch = documentChunks.splice(0, batchsize);
    
    // console.log(chunkBatch)
    // await processOneBatch(
    //   client,
    //   indexname,
    //   namespace,
    //   extractor,
    //   chunkBatch,
    //   chunkBatchIndex,
    //   filename
    // );
  }
}

function getFilename(filename: string): string {
  const docname = filename.substring(filename.lastIndexOf("\\") + 1);

  return docname.substring(0, docname.lastIndexOf(".")) || docname;
}

async function processOneBatch(
  client: Pinecone,
  indexname: string,
  namespace: string,
  extractor: FeatureExtractionPipeline,
  chunkBatch: string[],
  chunkBatchIndex: number,
  filename: string
) {
  const output = await extractor(
    chunkBatch.map((str) => str.replace(/\n/g, " "), {
      mean_pooling: "cls",
    })
  );

  const embeddings = output.tolist();
  let vectorBatch: PineconeRecord<RecordMetadata>[] = [];

  console.log(embeddings);

  for (let i = 0; i < chunkBatch.length; i++) {
    const chunk = chunkBatch[i];
    const embedding = embeddings[i];

    const vector: PineconeRecord<RecordMetadata> = {
      id: `${filename}-${chunkBatchIndex}-${i}`,
      values: embedding,
      metadata: {
        chunk,
      },
    };

    vectorBatch.push(vector);
  }

  const index = client.index(indexname).namespace(namespace);
  await index.upsert(vectorBatch);
  vectorBatch = [];
}
