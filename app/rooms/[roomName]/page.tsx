import { notFound } from 'next/navigation';
import { RoomClient } from '@/components/room/RoomClient';
import { ROOM_SLUG_PATTERN } from '@/lib/client-utils';
import { prettifySlug } from '@/lib/room-names';
import { isVideoCodec } from '@/lib/types';

type RoomParams = { params: Promise<{ roomName: string }> };

export async function generateMetadata({ params }: RoomParams) {
  const { roomName } = await params;
  return {
    title: `${prettifySlug(decodeURIComponent(roomName))} · Hainameet`,
    robots: { index: false, follow: false },
  };
}

export default async function Page({
  params,
  searchParams,
}: RoomParams & {
  searchParams: Promise<{ region?: string; hq?: string; codec?: string }>;
}) {
  const { roomName } = await params;
  const query = await searchParams;
  const slug = decodeURIComponent(roomName).toLowerCase();

  if (!ROOM_SLUG_PATTERN.test(slug)) {
    notFound();
  }

  const codec = typeof query.codec === 'string' && isVideoCodec(query.codec) ? query.codec : 'vp9';

  return (
    <RoomClient roomName={slug} region={query.region} hq={query.hq === 'true'} codec={codec} />
  );
}
