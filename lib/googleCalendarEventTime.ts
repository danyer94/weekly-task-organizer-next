const padTimePart = (value: number) => String(value).padStart(2, "0");

const createUtcDateTime = (date: string, time: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(Date.UTC(year, month - 1, day, hours, minutes));
};

const formatUtcDateTime = (value: Date) => {
  const year = value.getUTCFullYear();
  const month = padTimePart(value.getUTCMonth() + 1);
  const day = padTimePart(value.getUTCDate());
  const hours = padTimePart(value.getUTCHours());
  const minutes = padTimePart(value.getUTCMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}:00`;
};

export const buildTimedEventRange = (
  date: string,
  startTime: string,
  endTime?: string | null
) => {
  const start = createUtcDateTime(date, startTime);
  const end = endTime
    ? createUtcDateTime(date, endTime)
    : new Date(start.getTime() + 60 * 60 * 1000);

  return {
    startDateTime: formatUtcDateTime(start),
    endDateTime: formatUtcDateTime(end),
  };
};
