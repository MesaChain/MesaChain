import { TableTemplate } from '@/types/tableLayout';

export interface TableConfig {
  id: string;
  name: string;
  capacity: number;
  shape: 'square' | 'round';
  defaultSize: { w: number; h: number };
  visualScale: number;
  counterScale: number;
}

export const GRID_SIZES = [10, 15, 20, 25, 30, 35, 40, 45, 50] as const;
   
export const TABLE_CONFIGS: TableConfig[] = [
  {
    id: '2-seat-square',
    name: '2-Seat Square',
    capacity: 2,
    shape: 'square',
    defaultSize: { w: 2, h: 2 },
    visualScale: 1.2,
    counterScale: 0.73
  },
  {
    id: '4-seat-square',
    name: '4-Seat Square',
    capacity: 4,
    shape: 'square',
    defaultSize: { w: 3, h: 3 },
    visualScale: 1.1,
    counterScale: 0.87
  },
  {
    id: '4-seat-round',
    name: '4-Seat Round',
    capacity: 4,
    shape: 'round',
    defaultSize: { w: 3, h: 3 },
    visualScale: 1.2,
    counterScale: 0.83
  },
  {
    id: '6-seat-round',
    name: '6-Seat Round',
    capacity: 6,
    shape: 'round',
    defaultSize: { w: 4, h: 4 },
    visualScale: 1.1,
    counterScale: 0.91
  }
];

export const CAPACITY_OPTIONS = {
  square: [2, 4],
  round: [4, 6]
} as const;

export const getTableScale = (capacity: number, shape: 'square' | 'round') => {
  const config = TABLE_CONFIGS.find(c => c.capacity === capacity && c.shape === shape);
  return config
    ? { visual: config.visualScale, counter: config.counterScale }
    : { visual: 1.0, counter: 1.0 };
};

export const getTableTemplate = (config: TableConfig): TableTemplate => ({
  id: config.id,
  name: config.name,
  capacity: config.capacity,
  shape: config.shape,
  defaultSize: config.defaultSize
}); 