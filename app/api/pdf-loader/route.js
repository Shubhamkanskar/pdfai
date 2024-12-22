import { NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

/* const pdfUrl = "https://striped-wolf-206.convex.cloud/api/storage/a880b781-0450-4de8-a760-0885b5f186b3"
 */export async function GET(req) {
    /*1 load pdf file  */
    const reqUrl = req.url;
    const { searchParams } = new URL(reqUrl);
    const pdfUrl = searchParams.get("pdfUrl");
    console.log(pdfUrl);

    const response = await fetch(pdfUrl);
    const data = await response.blob();
    const loader = new WebPDFLoader(data);
    const docs = await loader.load();



    let pdfTextContent = "";
    docs.forEach((doc) => {
        pdfTextContent += doc.pageContent;
    })

    /* 2 split the text into chunks */
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 100,
        chunkOverlap: 10,
    });
    const output = await splitter.createDocuments([pdfTextContent]);

    let splitterList = [];
    output.forEach((doc) => {
        splitterList.push(doc.pageContent);
    })



    return NextResponse.json({ message: splitterList });
}