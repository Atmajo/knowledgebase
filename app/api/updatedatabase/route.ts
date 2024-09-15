import { NextApiRequest, NextApiResponse } from "next";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { Pinecone } from "@pinecone-database/pinecone";
import { updateVectorDB } from "@/utils";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { indexname, namespace } = body;
      await handleUpload(indexname, namespace, res);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: "Error uploading files" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return NextResponse.json({ message: `Method ${req.method} Not Allowed` });
  }

  return NextResponse.json({ message: "Upload completed" });
}

async function handleUpload(
  indexname: any,
  namespace: any,
  res: NextApiResponse
) {
  const loader = new DirectoryLoader("./documents", {
    ".pdf": (path: string) =>
      new PDFLoader(path, {
        splitPages: false,
      }),
    ".txt": (path: string) => new TextLoader(path),
  });

  const docs = await loader.load();
  const client = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  await updateVectorDB(
    client,
    indexname,
    namespace,
    docs,
    (filename, totalChunks, chunksUpserted, isCompleted) => {
      if (!isCompleted) {
        res.write(
          JSON.stringify({
            filename,
            totalChunks,
            chunksUpserted,
            isCompleted,
          })
        );
      } else {
        res.end();
      }
    }
  );

  return NextResponse.json({ message: "Upload completed" });
}
