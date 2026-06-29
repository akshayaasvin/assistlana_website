import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") || formData.get("resume");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const filename    = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer      = Buffer.from(arrayBuffer);
    let extractedText = "";

    if (filename.endsWith(".pdf")) {
      // Method 1: pdfjs-dist legacy build
      try {
        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "";
        const loadingTask = pdfjsLib.getDocument({
          data:            new Uint8Array(buffer),
          useWorkerFetch:  false,
          isEvalSupported: false,
          useSystemFonts:  true,
        });
        const pdf   = await loadingTask.promise;
        const parts = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page    = await pdf.getPage(i);
          const content = await page.getTextContent();
          parts.push(content.items.map(item => item.str).join(" "));
        }
        extractedText = parts.join("\n");
      } catch (pdfjsErr) {
        console.error("pdfjs-dist error:", pdfjsErr.message);

        // Method 2: pdf-parse fallback
        try {
          const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
          const result   = await pdfParse(buffer);
          extractedText  = result.text || "";
        } catch (parseErr) {
          console.error("pdf-parse error:", parseErr.message);
          // Return empty so upload page falls back to base64 Gemini path
          return NextResponse.json(
            { error: "Could not read PDF. Will try direct Gemini extraction." },
            { status: 422 }
          );
        }
      }
    } else if (filename.endsWith(".docx") || filename.endsWith(".doc")) {
      const mammoth = await import("mammoth");
      const result  = await mammoth.extractRawText({ buffer });
      extractedText = result.value || "";
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Upload a PDF or DOCX file." },
        { status: 400 }
      );
    }

    extractedText = extractedText.trim().slice(0, 6000);

    if (extractedText.length < 20) {
      return NextResponse.json(
        { error: "Could not extract text. File may be image-based or empty." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: extractedText });
  } catch (err) {
    console.error("Text extraction error:", err);
    return NextResponse.json(
      { error: "Text extraction failed: " + err.message },
      { status: 500 }
    );
  }
}
