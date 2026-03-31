import pdfParse from 'pdf-parse';

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  const text = result.text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (text.trim().length < 100) {
    throw new Error(
      'Could not extract enough text from the PDF. The file may be scanned or image-based.'
    );
  }
  return text;
}
