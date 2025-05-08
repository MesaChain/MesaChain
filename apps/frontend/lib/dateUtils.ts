export function getDateRange(date: Date, time: string, durationHours = 2) {
  const startTime = new Date(date);
  const [hours, minutes] = time.split(':');
  startTime.setHours(parseInt(hours), parseInt(minutes));

  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + durationHours);

  return { startTime, endTime };
} 