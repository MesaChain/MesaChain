'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useTableLayoutStore } from '@/store/useTableLayoutStore';
import { TableComponent } from './TableComponent';
import { TableTemplate } from '@/types/tableLayout';
import { Utensils } from 'lucide-react';
import { useTableLayoutActions } from './useTableLayoutActions';

export function LayoutCanvas() {
  const {
    tables,
    selectedTableId,
    zoom,
    gridSize,
  } = useTableLayoutStore();

  const {
    handleDrop,
    handleTableDragMove,
    handleTableDragEnd,
    handleTableClick
  } = useTableLayoutActions();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedTableId, setDraggedTableId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const [dragTemplate, setDragTemplate] = useState<TableTemplate | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);

  const checkCollision = useCallback((pos: { x: number; y: number; w: number; h: number }, excludeId?: string) => {
    return tables.some(table => {
      if (excludeId && table.id === excludeId) return false;
      return !(
        pos.x + pos.w <= table.position.x ||
        pos.x >= table.position.x + table.position.w ||
        pos.y + pos.h <= table.position.y ||
        pos.y >= table.position.y + table.position.h
      );
    });
  }, [tables]);

  const handleDragStart = useCallback((e: React.MouseEvent, tableId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDraggedTableId(tableId);
    
    const table = tables.find(t => t.id === tableId);
    if (table && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left - (table.position.x * gridSize);
      const offsetY = e.clientY - rect.top - (table.position.y * gridSize);
      setDragOffset({ x: offsetX, y: offsetY });
    }
  }, [tables, gridSize]);

  const handleDragMove = useCallback((e: React.MouseEvent) => {
    if (!draggedTableId || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = (e.clientX - rect.left - dragOffset.x) / gridSize;
    const rawY = (e.clientY - rect.top - dragOffset.y) / gridSize;
    
    const x = Math.max(0, Math.round(rawX));
    const y = Math.max(0, Math.round(rawY));
    
    const table = tables.find(t => t.id === draggedTableId);
    if (table) {
      handleTableDragMove(e, draggedTableId, dragOffset, gridSize, canvasRef, tables);
    }
  }, [draggedTableId, dragOffset, gridSize, tables, handleTableDragMove]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedTableId(null);
    setDragOffset({ x: 0, y: 0 });
    handleTableDragEnd();
  }, [handleTableDragEnd]);

  const handleItemClick = useCallback((tableId: string) => {
    if (!isDragging && !draggedTableId) {
      handleTableClick(tableId, isDragging);
    }
  }, [handleTableClick, isDragging, draggedTableId]);



  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    
    try {
      const templateData = event.dataTransfer.getData('application/json');
      if (templateData && canvasRef.current) {
        const template = JSON.parse(templateData);
        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.round((event.clientX - rect.left) / gridSize));
        const y = Math.max(0, Math.round((event.clientY - rect.top) / gridSize));
        setDragPosition({ x, y });
        
        if (!dragTemplate) {
          setDragTemplate(template);
        }
      }
    } catch (error) {
      console.error('Failed to parse drag data:', error);
    }
  }, [gridSize, dragTemplate]);

  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    try {
      const templateData = event.dataTransfer.getData('application/json');
      if (templateData) {
        setIsDragOver(true);
      }
    } catch (error) {
      console.error('Failed to parse drag data:', error);
    }
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!canvasRef.current?.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
      setDragTemplate(null);
    }
  }, []);



  const isDragPositionValid = dragTemplate && !checkCollision({
    x: dragPosition.x,
    y: dragPosition.y,
    w: dragTemplate.defaultSize.w,
    h: dragTemplate.defaultSize.h
  });



  return (
    <div
      ref={canvasRef}
      className="w-full h-full relative overflow-auto bg-gray-50"
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
                    onDrop={(event) => {
                handleDrop(event, gridSize, canvasRef);
                setIsDragOver(false);
                setDragTemplate(null);
              }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left'
        }}
      />

      {tables.map((table) => (
        <div
          key={table.id}
          className="absolute"
          style={{
            left: table.position.x * gridSize,
            top: table.position.y * gridSize,
            width: table.position.w * gridSize,
            height: table.position.h * gridSize,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left'
          }}
        >
          <TableComponent
            table={table}
            isSelected={selectedTableId === table.id}
            onClick={() => handleItemClick(table.id)}
            isDragging={isDragging}
            onDragStart={(e) => handleDragStart(e, table.id)}
          />
        </div>
      ))}

      {isDragOver && dragTemplate && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: dragPosition.x * gridSize,
            top: dragPosition.y * gridSize,
            width: dragTemplate.defaultSize.w * gridSize,
            height: dragTemplate.defaultSize.h * gridSize,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left'
          }}
        >
          <div
            className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed transition-colors ${
              isDragPositionValid 
                ? 'border-green-500 bg-green-50' 
                : 'border-red-500 bg-red-50'
            }`}
          >
            <div className="text-center">
              <Utensils className={`w-6 h-6 mx-auto mb-1 ${
                isDragPositionValid ? 'text-green-600' : 'text-red-600'
              }`} />
              <div className={`text-xs font-medium ${
                isDragPositionValid ? 'text-green-600' : 'text-red-600'
              }`}>
                {dragTemplate.name}
              </div>
              <div className={`text-xs ${
                isDragPositionValid ? 'text-green-500' : 'text-red-500'
              }`}>
                {isDragPositionValid ? 'Valid Position' : 'Invalid Position'}
              </div>
              <div className="text-xs text-blue-600 font-medium mt-1">
                Grid: {dragPosition.x}, {dragPosition.y}
              </div>
            </div>
          </div>
        </div>
      )}
      





    </div>
  );
} 