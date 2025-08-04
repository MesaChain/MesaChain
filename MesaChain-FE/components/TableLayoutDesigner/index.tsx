'use client';

import { useEffect } from 'react';
import { LayoutCanvas } from './LayoutCanvas';
import { ToolsPanel } from './ToolsPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { SkeletonLoader } from './SkeletonLoader';
import { useTableLayoutStore } from '@/store/useTableLayoutStore';

export function TableLayoutDesigner() {
  const { initializeFromStorage, selectedTableId, isLoading } = useTableLayoutStore();

  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
        <ToolsPanel />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-16 bg-gray-800 flex items-center justify-between px-6 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">
            Table Layout Designer
          </h2>
        </div>
        
        <div className="flex-1 relative overflow-hidden">
          <LayoutCanvas />
        </div>
      </div>
      
      {selectedTableId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 max-w-md">
            <PropertiesPanel />
          </div>
        </div>
      )}
    </div>
  );
} 