'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getOrCreatePlayerId } from '@/lib/utils';

export default function NewRoomPage() {
  const router = useRouter();

  useEffect(() => {
    async function createRoom() {
      try {
        const playerId = getOrCreatePlayerId();
        const res = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        sessionStorage.setItem('approxense_created_room', data.roomId);
        router.replace(`/room/${data.roomId}`);
      } catch {
        router.replace('/');
      }
    }
    createRoom();
  }, []);

  return (
    <div className="h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
      <p style={{ color: 'var(--color-text-muted)' }}>Oda oluşturuluyor…</p>
    </div>
  );
}
