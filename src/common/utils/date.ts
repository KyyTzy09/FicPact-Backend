export function getNextReflectionDate(
  days: number,
  hour: number,
  minute: number = 0,
): Date {
  const now = new Date();

  const next = new Date(now);
  next.setDate(now.getDate() + days);

  next.setHours(hour);
  next.setMinutes(minute);
  next.setSeconds(0);
  next.setMilliseconds(0);

  return next;
}

export function updateReflectionTime(
  date: Date,
  hour: number,
  minute: number = 0,
): Date {
  const updated = new Date(date);

  updated.setHours(hour);
  updated.setMinutes(minute);
  updated.setSeconds(0);
  updated.setMilliseconds(0);

  return updated;
}
