import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const filename = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    if (filename.endsWith(".pdf")) {
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      extractedText = data.text || "";
    } else if (filename.endsWith(".docx") || filename.endsWith(".doc")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || "";
    } else {
      return NextResponse.json({ error: "Unsupported file type. Upload a PDF or DOCX file." }, { status: 400 });
    }

    extractedText = extractedText.trim().slice(0, 6000);

    if (extractedText.length < 50) {
      return NextResponse.json({
        error: "Could not extract text. Please upload a text-based PDF or .docx file (not a scanned image).",
      }, { status: 422 });
    }

    return NextResponse.json({ text: extractedText });
  } catch (err) {
    return NextResponse.json({ error: "Text extraction failed: " + err.message }, { status: 500 });
  }
}
