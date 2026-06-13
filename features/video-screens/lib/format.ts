/** Format a number of seconds as `m:ss` (or `h:mm:ss` past an hour). */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/** Sum the durations of a list of videos (seconds, missing = 0). */
export function totalDuration(videos: { duration?: number }[]): number {
  return videos.reduce((sum, v) => sum + (v.duration ?? 0), 0);
}
