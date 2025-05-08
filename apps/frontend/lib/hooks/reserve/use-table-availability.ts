import { useQuery } from '@tanstack/react-query';
import { getDateRange } from '../../dateUtils';

interface Table {
  id: string;
  name: string;
  capacity: number;
  location: string;
  available: boolean;
}

export function useTableAvailability(selectedDate: Date, selectedTime: string, partySize: number) {
  return useQuery<Table[]>({
    queryKey: ['availability', selectedDate, selectedTime, partySize],
    queryFn: async () => {
      const { startTime, endTime } = getDateRange(selectedDate, selectedTime);
      const params = new URLSearchParams({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        partySize: partySize.toString(),
      });
      const res = await fetch(`/api/reservations/availability?${params.toString()}`);
      if (!res.ok) throw new Error('Error fetching availability');
      return res.json();
    },
  });
} 