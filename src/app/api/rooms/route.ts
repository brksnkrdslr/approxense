import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  playerId: z.string().min(1).max(100),
  displayName: z.string().max(50).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { playerId, displayName } = parsed.data;
  const supabase = createClient();

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .insert({ status: 'waiting' })
    .select()
    .single();

  if (roomError || !room) {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }

  await supabase.from('room_players').insert({
    room_id: room.id,
    player_id: playerId,
    display_name: displayName ?? null,
    is_ready: false,
    is_connected: true,
  });

  const baseUrl = req.headers.get('origin') ?? '';
  const joinUrl = `${baseUrl}/room/${room.id}`;

  return NextResponse.json({ roomId: room.id, joinUrl }, { status: 201 });
}
