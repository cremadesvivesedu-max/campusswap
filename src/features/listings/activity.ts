// Small helpers that make a listing page feel alive: "active 5 min ago", "popular".

export function formatLastActive(
  lastSeenAt: string | undefined,
  copy: { activeNow: string; activeAgo: string; minutes: string; hours: string; days: string },
  now = new Date()
) {
  if (!lastSeenAt) {
    return null;
  }
  const seen = Date.parse(lastSeenAt);
  if (Number.isNaN(seen)) {
    return null;
  }
  const minutes = Math.max(0, Math.floor((now.getTime() - seen) / 60000));
  if (minutes < 10) {
    return copy.activeNow;
  }
  const ago =
    minutes < 60
      ? copy.minutes.replace("{n}", String(minutes))
      : minutes < 60 * 24
        ? copy.hours.replace("{n}", String(Math.floor(minutes / 60)))
        : minutes < 60 * 24 * 30
          ? copy.days.replace("{n}", String(Math.floor(minutes / (60 * 24))))
          : null;
  return ago ? copy.activeAgo.replace("{time}", ago) : null;
}

/** A listing is "popular" when it gets clearly more attention than a typical one. */
export function isPopularListing(viewCount: number, saveCount: number) {
  return viewCount >= 50 || saveCount >= 8;
}
