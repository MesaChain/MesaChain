'use client';

import { useTableLayoutStore } from '@/store/useTableLayoutStore';
import { TableTemplate } from '@/types/tableLayout';
import { GRID_SIZES, TABLE_CONFIGS, getTableTemplate } from './tableConfig';

const ZOOM_CONFIG = {
  min: 0.3,
  max: 2.0,
  step: 0.1
};

interface DraggableTableOptionProps {
  config: typeof TABLE_CONFIGS[0];
  onDragStart: (template: TableTemplate, event: React.DragEvent) => void;
  onActivateToolsMode: () => void;
}

function DraggableTableOption({ config, onDragStart, onActivateToolsMode }: DraggableTableOptionProps) {
  const handleDragStart = (event: React.DragEvent) => {
    const template = getTableTemplate(config);
    
    onActivateToolsMode();
    event.dataTransfer.setData('application/json', JSON.stringify(template));
    event.dataTransfer.effectAllowed = 'copy';
    onDragStart(template, event);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="w-full p-3 bg-gray-200 hover:bg-gray-300 rounded-md text-left transition-all duration-200 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center justify-center">
        <span className="text-sm font-medium text-gray-900">
          {config.name}
        </span>
      </div>
    </div>
  );
}

export function ToolsPanel() {
  const { clearLayout, zoom, setZoom, gridSize, setGridSize, setToolsPanelMode } = useTableLayoutStore();

  const handleDragStart = (template: TableTemplate, event: React.DragEvent) => {
    setToolsPanelMode(true);
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + ZOOM_CONFIG.step, ZOOM_CONFIG.max));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - ZOOM_CONFIG.step, ZOOM_CONFIG.min));
  };

  return (
    <div className="p-4 h-full flex flex-col overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tools</h3>
      
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Add Tables</h4>
        <div className="space-y-2">
          {TABLE_CONFIGS.map((config) => (
            <DraggableTableOption
              key={config.id}
              config={config}
              onDragStart={handleDragStart}
              onActivateToolsMode={() => setToolsPanelMode(true)}
            />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Grid Size</h4>
        <select
          value={gridSize}
          onChange={(e) => setGridSize(Number(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {GRID_SIZES.map((size) => (
            <option key={size} value={size}>{size}px</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Zoom ({Math.round(zoom * 100)}%)</h4>
        <div className="flex gap-2">
          <button 
            onClick={handleZoomOut}
            className="flex-1 p-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 13v-3m0 0V7m0 3h3m-3 0H7" />
            </svg>
          </button>
          <button 
            onClick={handleZoomIn}
            className="flex-1 p-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Actions</h4>
        <button
          onClick={clearLayout}
          className="w-full p-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
        >
          Clear Layout
        </button>
      </div>
    </div>
  );
} 