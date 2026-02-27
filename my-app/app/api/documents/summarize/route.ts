import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPdf, summarizeText } from '@/app/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json();
    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // download file from storage
    const { data, error: downloadError } = await supabase.storage
      .from('documents')
      .download(filename);

    if (downloadError || !data) {
      return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
    }

    const arrayBuffer = await data.arrayBuffer();
    const text = await extractTextFromPdf(arrayBuffer);
    const summary = await summarizeText(text);

    // optional: store summary in database
    await supabase.from('summaries').insert({ filename, summary, created_at: new Date() });

    return NextResponse.json({ summary });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown' }, { status: 500 });
  }
}