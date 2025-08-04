'use client';

import { useRef, useState } from 'react';
import { TableTemplate } from '@/types/tableLayout';

interface DraggableTableTemplateProps {
  template: TableTemplate;
  onDragStart: (template: TableTemplate, event: React.DragEvent) => void;
  onActivateToolsMode: () => void;
}

export function DraggableTableTemplate({ template, onDragStart, onActivateToolsMode }: DraggableTableTemplateProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (event: React.DragEvent) => {
    setIsDragging(true);
    onActivateToolsMode();
    
    event.dataTransfer.setData('application/json', JSON.stringify(template));
    event.dataTransfer.effectAllowed = 'copy';
    
    if (dragRef.current) {
      event.dataTransfer.setDragImage(dragRef.current, 20, 20);
    }
    
    onDragStart(template, event);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={dragRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`w-full p-3 bg-gray-200 hover:bg-gray-300 rounded-md text-left transition-all duration-200 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">
          {template.name}
        </span>
        <div 
          className={`w-6 h-6 border-2 border-gray-600 ${
            template.shape === 'round' ? 'rounded-full' : 'rounded'
          }`} 
        />
      </div>
      <div className="text-xs text-gray-600 mt-1">
        {template.capacity} seats
      </div>
      
      <div className="mt-2 flex items-center text-xs text-gray-500">
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        Drag to canvas
      </div>
    </div>
  );
} 