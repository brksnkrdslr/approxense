import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({ playerId: z.string().min(1).max(100) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { playerId } = parsed.data;
  const supabase = createClient();

  await supabase
    .from('room_players')
    .update({ is_ready: true })
    .eq('room_id', roomId)
    .eq('player_id', playerId);

  const { data: players } = await supabase
    .from('room_players')
    .select('is_ready')
    .eq('room_id', roomId)
    .eq('is_connected', true);

  const total = players?.length ?? 0;
  const readyCount = players?.filter((p) => p.is_ready).length ?? 0;
  const canStartNow = readyCount > total / 2;

  if (readyCount === total && total >= 2) {
    await supabase
      .from('rooms')
      .update({ status: 'countdown' })
      .eq('id', roomId)
      .eq('status', 'waiting');
  }

  return NextResponse.json({ readyCount, totalCount: total, canStartNow });
}
