import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractTextFromPdf(buffer: ArrayBuffer) {
  const pdfModule: any = await import('pdf-parse');
  const pdf = pdfModule.default || pdfModule;
  const data = await pdf(buffer);
  return data.text;
}

export async function summarizeText(text: string) {
  const prompt = `Please write a concise summary (3-4 sentences) of the following document:\n\n${text}`;
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a helpful summarization assistant.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 400,
  });
  return resp.choices[0].message?.content?.trim();
}