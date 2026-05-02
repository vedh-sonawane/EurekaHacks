const SCOPES = "https://www.googleapis.com/auth/youtube.readonly";
const YT = "https://www.googleapis.com/youtube/v3";

export type VideoItem = {
  id: string;
  title: string;
  channel: string;
};

export type VideoGroup = {
  label: string;
  videos: VideoItem[];
};

// Uses Google Identity Services (gsi/client loaded in index.html).
// No redirect URI needed — GIS handles the popup internally.
export function requestYouTubeToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) {
      reject(new Error("VITE_GOOGLE_CLIENT_ID is not set in your .env file."));
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gsi = (window as any).google?.accounts?.oauth2;
    if (!gsi) {
      reject(new Error("Google Identity Services not loaded yet — try again in a moment."));
      return;
    }

    const client = gsi.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callback: (response: any) => {
        if (response.error) {
          reject(new Error(response.error_description ?? response.error));
        } else {
          resolve(response.access_token as string);
        }
      },
    });

    client.requestAccessToken();
  });
}

async function ytGet(path: string, token: string) {
  const res = await fetch(`${YT}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`YouTube API error ${res.status}`);
  return res.json();
}

// Videos the user has liked (up to 50)
export async function fetchLikedVideos(token: string): Promise<VideoItem[]> {
  const data = await ytGet("/videos?part=snippet&myRating=like&maxResults=50", token);
  return (data.items ?? []).map((v: any) => ({
    id: v.id,
    title: v.snippet.title,
    channel: v.snippet.channelTitle,
  }));
}

// Videos in the user's special "favorites" playlist (old YouTube feature — may be empty)
export async function fetchFavoriteVideos(token: string): Promise<VideoItem[]> {
  try {
    const ch = await ytGet("/channels?part=contentDetails&mine=true", token);
    const favId: string = ch.items?.[0]?.contentDetails?.relatedPlaylists?.favorites;
    if (!favId) return [];
    return fetchPlaylistItems(token, favId);
  } catch {
    return [];
  }
}

// All user playlists (up to 10) with their videos
export async function fetchUserPlaylists(token: string): Promise<VideoGroup[]> {
  const data = await ytGet(
    "/playlists?part=snippet,contentDetails&mine=true&maxResults=50",
    token
  );
  const playlists: { id: string; title: string }[] = (data.items ?? []).map((p: any) => ({
    id: p.id,
    title: p.snippet.title,
  }));

  const results = await Promise.allSettled(
    playlists.slice(0, 10).map(async (pl) => ({
      label: pl.title,
      videos: await fetchPlaylistItems(token, pl.id),
    }))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<VideoGroup> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((g) => g.videos.length > 0);
}

async function fetchPlaylistItems(token: string, playlistId: string): Promise<VideoItem[]> {
  const data = await ytGet(
    `/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50`,
    token
  );
  return (data.items ?? [])
    .filter((item: any) => item.snippet.resourceId?.kind === "youtube#video")
    .map((item: any) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      channel: item.snippet.videoOwnerChannelTitle ?? item.snippet.channelTitle ?? "",
    }));
}
