function wasToday(date: Date, today: Date) {
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function wasYesterday(date: Date, today: Date) {
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

function wasLast7Days(date: Date, today: Date) {
  const last7Days = new Date(today);
  last7Days.setDate(today.getDate() - 7);

  return date >= last7Days;
}

function wasLast30Days(date: Date, today: Date) {
  const last30Days = new Date(today);
  last30Days.setDate(today.getDate() - 30);

  return date >= last30Days;
}

function getDateDescription(date: string | number, today: Date) {
  const d = new Date(date);

  if (wasToday(d, today)) return "Today";
  if (wasYesterday(d, today)) return "Yesterday";
  if (wasLast7Days(d, today)) return "Last 7 days";
  if (wasLast30Days(d, today)) return "Last 30 days";

  return d.getFullYear().toString();
}

export function getChatDateDescription(
  current: string | number,
  previous: string | number | undefined | null,
  today: Date,
) {
  const c = getDateDescription(current, today);
  if (!previous) return c;
  const p = getDateDescription(previous, today);
  if (c === p) return null;
  return c;
}
