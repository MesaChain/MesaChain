import { create } from 'zustand';
import { Table, TableTemplate, LayoutState } from '@/types/tableLayout';
import { TABLE_CONFIGS } from '@/components/TableLayoutDesigner/tableConfig';

const STORAGE_KEY = 'mesachain-table-layout';

const initialTables: Table[] = [];

const getDefaultSize = (capacity: number, shape: 'square' | 'round') => {
  const config = TABLE_CONFIGS.find(
    c => c.capacity === capacity && c.shape === shape
  );
  return config?.defaultSize || { w: 2, h: 2 };
};

const loadFromStorage = (): LayoutState => {
  if (typeof window === 'undefined') {
    return {
      tables: initialTables,
      selectedTableId: null,
      isDragging: false,
      isResizing: false,
      zoom: 1,
      gridSize: 20,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
          const parsed = JSON.parse(stored);
    // Use proper logging solution or remove for production
      return {
        tables: (parsed.tables || []).map((table: any) => ({
          ...table,
          isVisible: table.isVisible !== undefined ? table.isVisible : true
        })),
        selectedTableId: null,
        isDragging: false,
        isResizing: false,
        zoom: parsed.zoom || 1,
        gridSize: parsed.gridSize || 20,
      };
    }
  } catch (error) {
    console.error('Error loading layout from storage:', error);
  }
  
  return {
    tables: initialTables,
    selectedTableId: null,
    isDragging: false,
    isResizing: false,
    zoom: 1,
    gridSize: 20,
  };
};

const saveToStorage = (state: LayoutState) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const dataToSave = {
      tables: state.tables,
      zoom: state.zoom,
      gridSize: state.gridSize,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    // Use proper logging solution or remove for production
  } catch (error) {
    console.error('Error saving layout to storage:', error);
  }
};

const checkCollision = (table1: { position: { x: number; y: number; w: number; h: number } }, 
                       table2: { position: { x: number; y: number; w: number; h: number } }): boolean => {
  return !(
    table1.position.x + table1.position.w <= table2.position.x ||
    table1.position.x >= table2.position.x + table2.position.w ||
    table1.position.y + table1.position.h <= table2.position.y ||
    table1.position.y >= table2.position.y + table2.position.h
  );
};

const isValidPosition = (newTable: { position: { x: number; y: number; w: number; h: number } } | { x: number; y: number; w: number; h: number }, 
                        existingTables: Table[], 
                        excludeTableId?: string): boolean => {
  const position = 'position' in newTable ? newTable.position : newTable;
  
  return !existingTables.some(table => {
    if (excludeTableId && table.id === excludeTableId) return false;
    return checkCollision({ position }, table);
  });
};

const findValidPosition = (desiredPosition: { x: number; y: number; w: number; h: number }, 
                          existingTables: Table[], 
                          excludeTableId?: string,
                          gridSize: number = 20): { x: number; y: number } => {
  const maxAttempts = 100;
  
  if (isValidPosition(desiredPosition, existingTables, excludeTableId)) {
    return { x: desiredPosition.x, y: desiredPosition.y };
  }
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const radius = Math.floor(attempt / 4) + 1;
    const direction = attempt % 4;
    
    let offsetX = 0, offsetY = 0;
    switch (direction) {
      case 0: offsetX = radius; offsetY = 0; break;
      case 1: offsetX = 0; offsetY = radius; break;
      case 2: offsetX = -radius; offsetY = 0; break;
      case 3: offsetX = 0; offsetY = -radius; break;
    }
    
    const testPosition = {
      x: desiredPosition.x + offsetX,
      y: desiredPosition.y + offsetY,
      w: desiredPosition.w,
      h: desiredPosition.h
    };
    
    if (isValidPosition(testPosition, existingTables, excludeTableId)) {
      return { x: testPosition.x, y: testPosition.y };
    }
  }
  
  return { x: desiredPosition.x, y: desiredPosition.y };
};

interface TableLayoutStore extends LayoutState {
  addTable: (template: TableTemplate, position: { x: number; y: number }, isVisible?: boolean) => string;
  makeTableVisible: (tableId: string) => void;
  updateTable: (tableId: string, updates: Partial<Table>) => void;
  deleteTable: (tableId: string) => void;
  selectTable: (tableId: string | null) => void;
  setDragging: (isDragging: boolean) => void;
  setResizing: (isResizing: boolean) => void;
  setZoom: (zoom: number) => void;
  setGridSize: (gridSize: number) => void;
  clearLayout: () => void;
  saveLayout: () => void;
  loadLayout: () => void;
  initializeFromStorage: () => void;
  isFromToolsPanel: boolean;
  setToolsPanelMode: (isFromToolsPanel: boolean) => void;
  getSelectedTable: () => Table | null;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useTableLayoutStore = create<TableLayoutStore>((set, get) => ({
  tables: initialTables,
  selectedTableId: null,
  isDragging: false,
  isResizing: false,
  zoom: 1,
  gridSize: 20,
  isLoading: true,
  isFromToolsPanel: false,
  addTable: (template, position, isVisible = true) => {
    const state = get();
    const uniqueId = `table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTable: Table = {
      id: uniqueId,
      name: `T-${state.tables.length + 1}`,
      capacity: template.capacity,
      shape: template.shape,
      status: 'available',
      position: {
        x: position.x,
        y: position.y,
        w: template.defaultSize.w,
        h: template.defaultSize.h
      },
      bookings: [],
      orders: [],
      isVisible
    };

    if (!isValidPosition(newTable, state.tables)) {
      const validPosition = findValidPosition(newTable.position, state.tables, undefined, state.gridSize);
      newTable.position.x = validPosition.x;
      newTable.position.y = validPosition.y;
    }

    set((state) => {
      const newState = {
        ...state,
        tables: [...state.tables, newTable],
        selectedTableId: newTable.id
      };
      saveToStorage(newState);
      return newState;
    });

    return uniqueId;
  },

  makeTableVisible: (tableId: string) => {
    set((state) => {
      const newState = {
        ...state,
        tables: state.tables.map((table) => 
          table.id === tableId ? { ...table, isVisible: true } : table
        )
      };
      saveToStorage(newState);
      return newState;
    });
  },

  updateTable: (tableId, updates) => {
    set((state) => {
      const newState = {
        ...state,
        tables: state.tables.map((table) => {
          if (table.id === tableId) {
            const updatedTable = { ...table, ...updates };
            
            if (updates.capacity !== undefined && updates.capacity !== table.capacity) {
              const newSize = getDefaultSize(updates.capacity, updatedTable.shape);
              const newPosition = {
                ...updatedTable.position,
                w: newSize.w,
                h: newSize.h
              };
              
              const tempTable = { ...updatedTable, position: newPosition };
                          if (!isValidPosition(tempTable, state.tables, tableId)) {
              // Return false or throw an error to indicate failure
              return table;
            } else {
                updatedTable.position = newPosition;
              }
            }

            if (updates.position) {
              const tempTable = { ...updatedTable, position: updates.position };
                          if (!isValidPosition(tempTable, state.tables, tableId)) {
              // Return false or throw an error to indicate failure
              return table;
            }
            } 
            
            return updatedTable;
          }
          return table;
        })
      };
      saveToStorage(newState);
      return newState;
    });
  },

  deleteTable: (tableId) => {
    set((state) => {
      const newState = {
        ...state,
        tables: state.tables.filter((table) => table.id !== tableId),
        selectedTableId: state.selectedTableId === tableId ? null : state.selectedTableId
      };
      saveToStorage(newState);
      return newState;
    });
  },

  selectTable: (tableId) => {
    set({ selectedTableId: tableId });
  },

  setDragging: (isDragging) => {
    set({ isDragging });
  },

  setResizing: (isResizing) => {
    set({ isResizing });
  },

  setZoom: (zoom) => {
    set((state) => {
      const newState = { ...state, zoom };
      saveToStorage(newState);
      return newState;
    });
  },

  setGridSize: (gridSize) => {
    set((state) => {
      const newState = { ...state, gridSize };
      saveToStorage(newState);
      return newState;
    });
  },

  clearLayout: () => {
    set((state) => {
      const newState = { ...state, tables: [], selectedTableId: null };
      saveToStorage(newState);
      return newState;
    });
  },

  saveLayout: () => {
    const state = get();
    saveToStorage(state);
  },

  loadLayout: () => {
    const loadedState = loadFromStorage();
    set(loadedState);
  },

  initializeFromStorage: () => {
    const { setLoading } = get();
    setTimeout(() => {
      const loadedState = loadFromStorage();
      set({ ...loadedState, isLoading: false });
    }, 500);
  },

  getSelectedTable: () => {
    const state = get();
    return state.tables.find(table => table.id === state.selectedTableId) || null;
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setToolsPanelMode: (isFromToolsPanel) => {
    set({ isFromToolsPanel });
  }
})); 