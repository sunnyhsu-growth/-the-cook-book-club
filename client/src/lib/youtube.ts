// Turn a pasted YouTube URL into an embeddable URL (or null if unrecognized).
export function youtubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, '');
    let id = '';
    if (host === 'youtu.be') id = u.pathname.slice(1);
    else if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (u.pathname === '/watch') id = u.searchParams.get('v') || '';
      else if (u.pathname.startsWith('/embed/')) id = u.pathname.slice('/embed/'.length);
      else if (u.pathname.startsWith('/shorts/')) id = u.pathname.slice('/shorts/'.length);
    }
    id = id.split(/[/?&]/)[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

// A YouTube search for the dish — used as the auto "closest cooking videos" link.
export function youtubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} recipe`)}`;
}
