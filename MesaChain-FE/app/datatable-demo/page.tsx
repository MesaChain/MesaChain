'use client';

import React, { useState } from 'react';
import { DataTable, ColumnDefinition } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Sample data type
interface Order {
  id: string;
  customerName: string;
  items: string[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  paymentMethod: 'cash' | 'card' | 'crypto';
}

// Sample data
const sampleOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'John Doe',
    items: ['Burger', 'Fries', 'Coke'],
    total: 25.50,
    status: 'completed',
    createdAt: '2024-01-15T10:30:00Z',
    paymentMethod: 'card'
  },
  {
    id: 'ORD-002',
    customerName: 'Jane Smith',
    items: ['Pizza', 'Salad'],
    total: 18.75,
    status: 'pending',
    createdAt: '2024-01-15T11:15:00Z',
    paymentMethod: 'cash'
  },
  {
    id: 'ORD-003',
    customerName: 'Bob Johnson',
    items: ['Pasta', 'Wine'],
    total: 32.00,
    status: 'completed',
    createdAt: '2024-01-15T12:00:00Z',
    paymentMethod: 'crypto'
  },
  {
    id: 'ORD-004',
    customerName: 'Alice Brown',
    items: ['Sandwich', 'Coffee'],
    total: 12.25,
    status: 'cancelled',
    createdAt: '2024-01-15T13:30:00Z',
    paymentMethod: 'card'
  },
  {
    id: 'ORD-005',
    customerName: 'Charlie Wilson',
    items: ['Steak', 'Potatoes', 'Beer'],
    total: 45.80,
    status: 'pending',
    createdAt: '2024-01-15T14:45:00Z',
    paymentMethod: 'card'
  }
];

// Column definitions
const columns: ColumnDefinition<Order>[] = [
  {
    key: 'id',
    header: 'Order ID',
    sortable: true,
    filterable: true,
    width: '120px'
  },
  {
    key: 'customerName',
    header: 'Customer',
    sortable: true,
    filterable: true,
    width: '150px'
  },
  {
    key: 'items',
    header: 'Items',
    render: (value: string[]) => value.join(', '),
    filterable: true,
    width: '200px'
  },
  {
    key: 'total',
    header: 'Total',
    render: (value: number) => `$${value.toFixed(2)}`,
    sortable: true,
    align: 'right',
    width: '100px'
  },
  {
    key: 'status',
    header: 'Status',
    render: (value: string) => {
      const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
      };
      return (
        <Badge className={statusColors[value as keyof typeof statusColors]}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      );
    },
    sortable: true,
    filterable: true,
    width: '120px'
  },
  {
    key: 'paymentMethod',
    header: 'Payment',
    render: (value: string) => {
      const methodColors = {
        cash: 'bg-gray-100 text-gray-800',
        card: 'bg-blue-100 text-blue-800',
        crypto: 'bg-purple-100 text-purple-800'
      };
      return (
        <Badge className={methodColors[value as keyof typeof methodColors]}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      );
    },
    sortable: true,
    filterable: true,
    width: '120px'
  },
  {
    key: 'createdAt',
    header: 'Date',
    render: (value: string) => new Date(value).toLocaleDateString(),
    sortable: true,
    width: '120px'
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (_, row) => (
      <div className="flex space-x-2">
        <Button size="sm" variant="outline">
          View
        </Button>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </div>
    ),
    width: '150px'
  }
];

export default function DataTableDemo() {
  const [data, setData] = useState<Order[]>(sampleOrders);
  const [loading, setLoading] = useState(false);

  const handleRowClick = (row: Order) => {
    console.log('Row clicked:', row);
  };

  const handleRowSelect = (selectedRows: Order[]) => {
    console.log('Selected rows:', selectedRows);
  };

  const handleExport = (format: string, data: Order[]) => {
    console.log(`Exporting ${data.length} rows as ${format}`);
  };

  const handleBulkAction = (action: string, rows: Order[]) => {
    console.log(`Bulk action "${action}" on ${rows.length} rows`);
    
    if (action === 'delete') {
      const idsToDelete = new Set(rows.map(row => row.id));
      setData(prev => prev.filter(order => !idsToDelete.has(order.id)));
    }
  };

  const addSampleData = () => {
    const newOrder: Order = {
      id: `ORD-${String(data.length + 1).padStart(3, '0')}`,
      customerName: `Customer ${data.length + 1}`,
      items: ['Sample Item'],
      total: Math.random() * 50 + 10,
      status: ['pending', 'completed', 'cancelled'][Math.floor(Math.random() * 3)] as any,
      createdAt: new Date().toISOString(),
      paymentMethod: ['cash', 'card', 'crypto'][Math.floor(Math.random() * 3)] as any
    };
    setData(prev => [...prev, newOrder]);
  };

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Interactive DataTable Component
        </h1>
        <p className="text-gray-600">
          A comprehensive data table with sorting, filtering, pagination, row selection, 
          expandable rows, export functionality, and full accessibility support.
        </p>
      </div>

      <div className="mb-4 flex space-x-4">
        <Button onClick={addSampleData}>
          Add Sample Data
        </Button>
        <Button onClick={simulateLoading} variant="outline">
          Simulate Loading
        </Button>
        <Button onClick={() => setData(sampleOrders)} variant="outline">
          Reset Data
        </Button>
      </div>

      {/* Single Comprehensive DataTable */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <DataTable
          data={data}
          columns={columns}
          selectable
          expandable
          exportable
          exportFormats={['csv', 'json']}
          onRowClick={handleRowClick}
          onRowSelect={handleRowSelect}
          onExport={handleExport}
          onBulkAction={handleBulkAction}
          onRowExpand={(row) => console.log('Row expanded:', row)}
          onSortChange={(sort) => console.log('Sort changed:', sort)}
          onFilterChange={(filters) => console.log('Filters changed:', filters)}
          onPageChange={(page) => console.log('Page changed:', page)}
          loading={loading}
          striped
          hoverable
          maxHeight="600px"
          bulkActions={[
            { label: 'Delete Selected', action: 'delete', variant: 'destructive' },
            { label: 'Mark as Completed', action: 'complete' },
            { label: 'Export Selected', action: 'export' }
          ]}
        />
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Features Implemented:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li><strong>Sorting:</strong> Click column headers to sort ascending/descending</li>
          <li><strong>Filtering:</strong> Global search and individual column filters</li>
          <li><strong>Pagination:</strong> Configurable page sizes with navigation controls</li>
          <li><strong>Row Selection:</strong> Single and multi-select with bulk actions</li>
          <li><strong>Export:</strong> Export to CSV and JSON formats</li>
          <li><strong>Expandable Rows:</strong> Click expand button to see row details</li>
          <li><strong>Custom Renderers:</strong> Status badges, payment method badges, formatted currency</li>
          <li><strong>Loading States:</strong> Skeleton screens during data loading</li>
          <li><strong>Responsive Design:</strong> Mobile-friendly with horizontal scrolling</li>
          <li><strong>Accessibility:</strong> Full keyboard navigation and ARIA support</li>
          <li><strong>Server-side Support:</strong> Ready for server-side data handling</li>
        </ul>
      </div>
    </div>
  );
}