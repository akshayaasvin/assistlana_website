import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const filename  = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    let extractedText = "";

    if (filename.endsWith(".pdf")) {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      // Disable worker — not available in server/Node.js environment
      pdfjsLib.GlobalWorkerOptions.workerSrc = "";
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch:  false,
        isEvalSupported: false,
        useSystemFonts:  true,
      });
      const pdf = await loadingTask.promise;
      const parts = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page    = await pdf.getPage(i);
        const content = await page.getTextContent();
        parts.push(content.items.map(item => item.str).join(" "));
      }
      extractedText = parts.join("\n");
    } else if (filename.endsWith(".docx") || filename.endsWith(".doc")) {
      const mammoth = await import("mammoth");
      const result  = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
      extractedText = result.value || "";
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Upload a PDF or DOCX file." },
        { status: 400 }
      );
    }

    extractedText = extractedText.trim().slice(0, 6000);

    if (extractedText.length < 50) {
      return NextResponse.json(
        { error: "Could not extract text. Please upload a text-based PDF or DOCX file (not a scanned image)." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: extractedText });
  } catch (err) {
    console.error("Text extraction error:", err);
    return NextResponse.json({ error: "Text extraction failed: " + err.message }, { status: 500 });
  }
}
