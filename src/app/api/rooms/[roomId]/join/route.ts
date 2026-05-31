import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  playerId: z.string().min(1).max(100),
  displayName: z.string().max(50).optional(),
});

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

  const { playerId, displayName } = parsed.data;
  const supabase = createClient();

  const { data: room } = await supabase
    .from('rooms')
    .select('id, status, max_players')
    .eq('id', roomId)
    .single();

  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  const { count } = await supabase
    .from('room_players')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', roomId)
    .eq('is_connected', true);

  if ((count ?? 0) >= room.max_players) {
    return NextResponse.json({ error: 'Room full' }, { status: 409 });
  }

  // Kaçıncı oyuncu olduğunu hesapla (join sırasına göre)
  const { data: existing } = await supabase
    .from('room_players')
    .select('player_id')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true });

  const existingIds = existing?.map((p) => p.player_id) ?? [];
  const playerIndex = existingIds.includes(playerId)
    ? existingIds.indexOf(playerId)
    : existingIds.length;
  const playerNumber = playerIndex + 1;
  const assignedName = displayName ?? `Oyuncu ${playerNumber}`;

  await supabase.from('room_players').upsert({
    room_id: roomId,
    player_id: playerId,
    display_name: assignedName,
    is_ready: false,
    is_connected: true,
  }, { onConflict: 'room_id,player_id' });

  const { count: newCount } = await supabase
    .from('room_players')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', roomId)
    .eq('is_connected', true);

  return NextResponse.json({ success: true, playerCount: newCount ?? 1, playerNumber, displayName: assignedName });
}
