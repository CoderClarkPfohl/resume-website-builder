import mammoth from 'mammoth';

export async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (text.trim().length < 100) {
    throw new Error('Could not extract enough text from the DOCX file.');
  }
  return text;
}
