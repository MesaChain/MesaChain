import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getDateRange } from '../../dateUtils';

export function useCreateReservation(selectedDate: Date, selectedTime: string, partySize: number, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tableId: string) => {
      const { startTime, endTime } = getDateRange(selectedDate, selectedTime);
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          partySize,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create reservation');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Reservation created successfully!');
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create reservation');
    },
  });
} 