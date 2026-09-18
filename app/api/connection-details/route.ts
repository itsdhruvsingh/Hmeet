import { AccessToken, type AccessTokenOptions, type VideoGrant } from 'livekit-server-sdk';
import { NextResponse, type NextRequest } from 'next/server';
import { ROOM_SLUG_PATTERN, randomString } from '@/lib/client-utils';
import { getLiveKitURL } from '@/lib/getLiveKitURL';
import type { ConnectionDetails } from '@/lib/types';

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

const COOKIE_KEY = 'haina-participant-postfix';
const COOKIE_TTL_MS = 2 * 60 * 60 * 1000;
const NAME_LIMIT = 32;

export async function GET(request: NextRequest) {
  try {
    if (!API_KEY || !API_SECRET || !LIVEKIT_URL) {
      return new NextResponse('The server is missing its LiveKit credentials.', { status: 500 });
    }

    const roomName = request.nextUrl.searchParams.get('roomName')?.toLowerCase() ?? '';
    const participantName = request.nextUrl.searchParams.get('participantName')?.trim() ?? '';
    const region = request.nextUrl.searchParams.get('region');

    if (!ROOM_SLUG_PATTERN.test(roomName)) {
      return new NextResponse('That room code is not valid.', { status: 400 });
    }
    if (participantName.length === 0 || participantName.length > NAME_LIMIT) {
      return new NextResponse('Pick a name between 1 and 32 characters.', { status: 400 });
    }

    const serverUrl = region ? getLiveKitURL(LIVEKIT_URL, region) : LIVEKIT_URL;
    const postfix = request.cookies.get(COOKIE_KEY)?.value ?? randomString(4);

    const participantToken = await createParticipantToken(
      {
        identity: `${participantName}__${postfix}`,
        name: participantName,
      },
      roomName,
    );

    const payload: ConnectionDetails = {
      serverUrl,
      roomName,
      participantToken,
      participantName,
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'no-store',
        'Set-Cookie': [
          `${COOKIE_KEY}=${postfix}`,
          'Path=/',
          'HttpOnly',
          'SameSite=Strict',
          'Secure',
          `Expires=${new Date(Date.now() + COOKIE_TTL_MS).toUTCString()}`,
        ].join('; '),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not mint a token.';
    return new NextResponse(message, { status: 500 });
  }
}

function createParticipantToken(user: AccessTokenOptions, roomName: string) {
  const token = new AccessToken(API_KEY, API_SECRET, user);
  token.ttl = '5m';
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  token.addGrant(grant);
  return token.toJwt();
}
