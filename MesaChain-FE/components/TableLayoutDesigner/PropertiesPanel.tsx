'use client';

import { useState, useEffect } from 'react';
import { useTableLayoutStore } from '@/store/useTableLayoutStore';
import { TableStatus } from '@/types/tableLayout';
import { CAPACITY_OPTIONS, TABLE_CONFIGS } from './tableConfig';

const checkTableCollision = (
  table1: { position: { x: number; y: number; w: number; h: number } },
  table2: { position: { x: number; y: number; w: number; h: number } }
): boolean => {
  return !(
    table1.position.x + table1.position.w <= table2.position.x ||
    table1.position.x >= table2.position.x + table2.position.w ||
    table1.position.y + table1.position.h <= table2.position.y ||
    table1.position.y >= table2.position.y + table2.position.h
  );
};

export function PropertiesPanel() {
  const { getSelectedTable, updateTable, deleteTable, selectTable, makeTableVisible } = useTableLayoutStore();
  const selectedTable = getSelectedTable();
  
  const isInvisibleTable = selectedTable && !selectedTable.isVisible;

  const [formData, setFormData] = useState({
    name: '',
    capacity: 2,
    status: 'available' as TableStatus,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedTable) {
      setFormData({
        name: selectedTable.name,
        capacity: selectedTable.capacity,
        status: selectedTable.status,
      });
      setHasChanges(false);
      setError(null);
    }
  }, [selectedTable]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setError(null);
  };

  const handleSave = () => {
    if (selectedTable && hasChanges) {
      if (formData.capacity !== selectedTable.capacity) {
        const newConfig = TABLE_CONFIGS.find(config => 
          config.capacity === formData.capacity && config.shape === selectedTable.shape
        );
        
        if (newConfig) {
          const newPosition = {
            ...selectedTable.position,
            w: newConfig.defaultSize.w,
            h: newConfig.defaultSize.h
          };
          
          const { tables } = useTableLayoutStore.getState();
          const tempTable = { ...selectedTable, position: newPosition };
          
          const hasCollision = tables.some(table => 
            table.id !== selectedTable.id && checkTableCollision(tempTable, table)
          );
          
          if (hasCollision) {
            setError('Cannot resize table. There are other tables in the way. Move nearby tables first.');
            return;
          }
        }
      }
      
      updateTable(selectedTable.id, formData);
      setHasChanges(false);
      setError(null);
      selectTable(null);
    }
  };

  const handleConfirm = () => {
    if (isInvisibleTable && selectedTable) {
      makeTableVisible(selectedTable.id);
      updateTable(selectedTable.id, formData);
      selectTable(null);
    } else if (selectedTable) {
      updateTable(selectedTable.id, formData);
      selectTable(null);
    }
  };



  const handleCancel = () => {
    if (selectedTable) {
      if (isInvisibleTable) {
        deleteTable(selectedTable.id);
      } else {
        setFormData({
          name: selectedTable.name,
          capacity: selectedTable.capacity,
          status: selectedTable.status,
        });
        setHasChanges(false);
        setError(null);
      }
    }
    selectTable(null);
  };

  const handleDelete = () => {
    if (selectedTable) {
      deleteTable(selectedTable.id);
    }
  };

  if (!selectedTable) {
    return null;
  }

  const availableCapacities = CAPACITY_OPTIONS[selectedTable.shape];

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Table {selectedTable.name}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value as TableStatus)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="occupied">Occupied</option>
            <option value="out-of-service">Out of Service</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seats
          </label>
          <select
            value={formData.capacity}
            onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availableCapacities.map((capacity) => (
              <option key={capacity} value={capacity}>
                {capacity} seats
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        {isInvisibleTable ? (
          <>
            <button
              onClick={handleCancel}
              className="flex-1 p-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Confirm
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleDelete}
              className="flex-1 p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 p-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`flex-1 p-2 rounded-md transition-colors ${
                hasChanges 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Save
            </button>
          </>
        )}
      </div>
    </div>
  );
} 