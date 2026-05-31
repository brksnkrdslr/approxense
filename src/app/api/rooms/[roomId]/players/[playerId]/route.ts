import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string; playerId: string }> }
) {
  const { roomId, playerId } = await params;
  const supabase = createClient();

  await supabase
    .from('room_players')
    .update({ is_connected: false })
    .eq('room_id', roomId)
    .eq('player_id', playerId);

  return NextResponse.json({ success: true });
}
