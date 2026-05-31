import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const supabase = createClient();

  await supabase
    .from('rooms')
    .update({ status: 'waiting', game_started_at: null })
    .eq('id', roomId);

  await supabase
    .from('room_players')
    .update({ is_ready: false })
    .eq('room_id', roomId);

  return NextResponse.json({ success: true });
}
