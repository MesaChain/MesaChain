import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { useTableAvailability } from '../../lib/hooks/reserve/use-table-availability';
import { useCreateReservation } from '../../lib/hooks/reserve/use-create-reservation';

export default function ReservePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('19:00');
  const [partySize, setPartySize] = useState<number>(2);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const { data: tables, isLoading } = useTableAvailability(selectedDate, selectedTime, partySize);

  const createReservation = useCreateReservation(
    selectedDate,
    selectedTime,
    partySize,
    () => setSelectedTable(null)
  );

  const handleReserve = () => {
    if (selectedTable) {
      createReservation.mutate(selectedTable);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Select Date & Time</h2>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="mb-4"
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Time</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="17:00">5:00 PM</option>
              <option value="18:00">6:00 PM</option>
              <option value="19:00">7:00 PM</option>
              <option value="20:00">8:00 PM</option>
              <option value="21:00">9:00 PM</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Party Size</label>
            <div className="mt-1 flex items-center">
              <button
                onClick={() => setPartySize(Math.max(1, partySize - 1))}
                className="p-2 border rounded-l-md"
              >
                -
              </button>
              <span className="px-4 py-2 border-t border-b">{partySize}</span>
              <button
                onClick={() => setPartySize(partySize + 1)}
                className="p-2 border rounded-r-md"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Available Tables</h2>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {tables?.map((table) => (
                <button
                  key={table.id}
                  onClick={() => table.available && setSelectedTable(table.id)}
                  className={`p-4 rounded-lg border ${
                    table.available
                      ? 'bg-green-100 hover:bg-green-200'
                      : 'bg-red-100 cursor-not-allowed'
                  } ${
                    selectedTable === table.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  disabled={!table.available}
                >
                  <div className="font-medium">{table.name}</div>
                  <div className="text-sm text-gray-500">
                    Capacity: {table.capacity}
                  </div>
                  <div className="text-sm text-gray-500">
                    Location: {table.location}
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedTable && (
            <div className="mt-8">
              <button
                onClick={handleReserve}
                disabled={createReservation.isPending}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {createReservation.isPending ? 'Reserving...' : 'Confirm Reservation'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 