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

export function getWeekPeriodDate() {
  const now = new Date()
  const day = now.getDay()

  // 0 = Minggu
  const diff = (day === 0 ? -6 : 1 - day)

  // Awaal minggu
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() + diff)
  startOfWeek.setHours(0, 0, 0, 0)

  // Akhir minggu
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return { startOfWeek, endOfWeek }
}

export function getMonthPeriodDate() {
  const now = new Date()

  // Awal bulan
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  startOfMonth.setHours(0, 0, 0, 0)

  // Akhir bulan
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  endOfMonth.setHours(23, 59, 59, 999)

  return { startOfMonth, endOfMonth }
}

export function isSunday(date: Date) {
  return date.getDay() === 0
}

export function isLastDayOfMonth(date: Date) {
  const tomorrow = new Date(date)
  tomorrow.setDate(date.getDate() + 1)
  return tomorrow.getDate() === 1
}


export function getWeekRange(date: Date) {
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day

  const start = new Date(date)
  start.setDate(date.getDate() + diff)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

export function getMonthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  start.setHours(0, 0, 0, 0)

  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}