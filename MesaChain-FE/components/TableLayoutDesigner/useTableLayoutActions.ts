import { useCallback } from 'react';
import { useTableLayoutStore } from '@/store/useTableLayoutStore';
import { TableTemplate } from '@/types/tableLayout';

export function useTableLayoutActions() {
  const { addTable, updateTable, deleteTable, selectTable, setDragging, setResizing, isFromToolsPanel, setToolsPanelMode } = useTableLayoutStore();

  const handleDrop = useCallback((event: React.DragEvent, gridSize: number, canvasRef: React.RefObject<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      const templateData = event.dataTransfer.getData('application/json');
      if (templateData && canvasRef.current) {
        const template = JSON.parse(templateData);
        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.round((event.clientX - rect.left) / gridSize));
        const y = Math.max(0, Math.round((event.clientY - rect.top) / gridSize));
        
        if (isFromToolsPanel) {
          const newTableId = addTable(template, { x, y }, false);
          selectTable(newTableId);
        } else {
          addTable(template, { x, y }, true);
        }
      }
    } catch (error) {
      console.error('Failed to parse drop data:', error);
    }
  }, [isFromToolsPanel, addTable, selectTable]);

  const handleTableDrop = useCallback((event: React.DragEvent, tableId: string, gridSize: number, canvasRef: React.RefObject<HTMLDivElement>, tables: any[]) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.round((event.clientX - rect.left) / gridSize));
      const y = Math.max(0, Math.round((event.clientY - rect.top) / gridSize));
      
      const table = tables.find(t => t.id === tableId);
      if (table) {
        updateTable(tableId, { 
          position: { x, y, w: table.position.w, h: table.position.h } 
        });
      }
    }
  }, [updateTable]);

  const handleTableDragStart = useCallback((e: React.MouseEvent, tableId: string, tables: any[], gridSize: number, canvasRef: React.RefObject<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    
    const table = tables.find(t => t.id === tableId);
    if (table && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left - (table.position.x * gridSize);
      const offsetY = e.clientY - rect.top - (table.position.y * gridSize);
      
      return { offsetX, offsetY };
    }
    return null;
  }, [setDragging]);

  const handleTableDragMove = useCallback((e: React.MouseEvent, tableId: string, offset: { x: number; y: number }, gridSize: number, canvasRef: React.RefObject<HTMLDivElement>, tables: any[]) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = (e.clientX - rect.left - offset.x) / gridSize;
    const rawY = (e.clientY - rect.top - offset.y) / gridSize;
    
    const x = Math.max(0, Math.round(rawX));
    const y = Math.max(0, Math.round(rawY));
    
    const table = tables.find(t => t.id === tableId);
    if (table) {
      updateTable(tableId, {
        position: { x, y, w: table.position.w, h: table.position.h }
      });
    }
  }, [updateTable]);

  const handleTableDragEnd = useCallback(() => {
    setDragging(false);
  }, [setDragging]);

  const handleTableClick = useCallback((tableId: string, isDragging: boolean) => {
    if (!isDragging) {
      selectTable(tableId);
    }
  }, [selectTable]);

  const handleTableDeleteFromProperties = useCallback((tableId: string) => {
    deleteTable(tableId);
    selectTable(null);
  }, [deleteTable, selectTable]);

  const handleTableUpdate = useCallback((tableId: string, updates: any) => {
    updateTable(tableId, updates);
  }, [updateTable]);

  return {
    handleDrop,
    handleTableDrop,
    handleTableDragStart,
    handleTableDragMove,
    handleTableDragEnd,
    handleTableClick,
    handleTableDeleteFromProperties,
    handleTableUpdate,
  };
} 