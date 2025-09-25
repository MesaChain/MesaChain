'use client';

import React from 'react';
import { DataTable, ColumnDefinition } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Order } from './types';

interface OrderTableNewProps {
  orders: Order[];
  loading?: boolean;
  onOrderView?: (order: Order) => void;
  onOrderEdit?: (order: Order) => void;
  onOrderDelete?: (order: Order) => void;
  onBulkDelete?: (orders: Order[]) => void;
  onExport?: (format: string, data: Order[]) => void;
}

export function OrderTableNew({
  orders,
  loading = false,
  onOrderView,
  onOrderEdit,
  onOrderDelete,
  onBulkDelete,
  onExport
}: OrderTableNewProps) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const columns: ColumnDefinition<Order>[] = [
    {
      key: 'id',
      header: 'Order ID',
      render: (value: string) => (
        <span className="text-[#F4A340] font-medium text-sm">#{value}</span>
      ),
      sortable: true,
      filterable: true,
      width: '120px'
    },
    {
      key: 'items',
      header: 'Items',
      render: (items: string[]) => (
        <div className="max-w-[200px]">
          <span className="text-gray-900 text-sm">{items.join(', ')}</span>
        </div>
      ),
      filterable: true,
      width: '200px'
    },
    {
      key: 'date',
      header: 'Date',
      render: (value: string) => (
        <span className="text-gray-900 text-sm">{value}</span>
      ),
      sortable: true,
      filterable: true,
      width: '120px'
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (value: number) => (
        <span className="text-gray-900 text-sm font-medium">
          ${value.toFixed(2)}
        </span>
      ),
      sortable: true,
      align: 'right',
      width: '100px'
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {value}
        </Badge>
      ),
      sortable: true,
      filterable: true,
      width: '120px'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, order) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onOrderView?.(order); }}
            className="h-8 w-8 p-0"
            aria-label={`View order ${order.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onOrderEdit?.(order); }}
            className="h-8 w-8 p-0"
            aria-label={`Edit order ${order.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onOrderDelete?.(order); }}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            aria-label={`Delete order ${order.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      width: '140px'
    }
  ];

  const handleRowClick = (order: Order) => {
    onOrderView?.(order);
  };

  const handleBulkAction = (action: string, selectedOrders: Order[]) => {
    switch (action) {
      case 'delete':
        onBulkDelete?.(selectedOrders);
        break;
      case 'export':
        onExport?.('csv', selectedOrders);
        break;
      default:
        console.log('Unknown bulk action:', action);
    }
  };

  const handleExport = (format: string, data: Order[]) => {
    if (onExport) {
      onExport(format, data);
    } else {
      console.log(`Exporting ${data.length} orders as ${format}`);
    }
  };

  const bulkActions = [
    {
      label: 'Delete Selected',
      action: 'delete',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive' as const
    },
    {
      label: 'Export Selected',
      action: 'export',
      icon: <Eye className="h-4 w-4" />,
      variant: 'outline' as const
    }
  ];

  return (
    <div className="space-y-4">
      <DataTable
        data={orders}
        columns={columns}
        loading={loading}
        pagination={true}
        selectable={true}
        exportable={true}
        exportFormats={['csv', 'json']}
        striped={false}
        hoverable={true}
        defaultPageSize={25}
        pageSizeOptions={[10, 25, 50, 100]}
        onRowClick={handleRowClick}
        onExport={handleExport}
        bulkActions={bulkActions}
        rowKey="id"
        className="rounded-lg border border-gray-200 shadow-sm"
        emptyState={
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-sm text-gray-500 mb-6">There are no orders to display at the moment.</p>
            <Button className="bg-[#F4A340] hover:bg-[#E89938] text-white">
              Create New Order
            </Button>
          </div>
        }
        loadingState={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F4A340]"></div>
            <span className="ml-3 text-gray-600">Loading orders...</span>
          </div>
        }
      />
    </div>
  );
}
