import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DataTable, ColumnDefinition } from './data-table';
import { Badge } from './badge';
import { Button } from './button';

// Sample data type
interface SampleUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  orders: number;
  revenue: number;
}

// Sample data
const sampleUsers: SampleUser[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-01-15T10:30:00Z',
    orders: 24,
    revenue: 1250.50
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    status: 'active',
    lastLogin: '2024-01-14T14:22:00Z',
    orders: 18,
    revenue: 890.25
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'moderator',
    status: 'inactive',
    lastLogin: '2024-01-10T09:15:00Z',
    orders: 32,
    revenue: 2100.75
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'user',
    status: 'pending',
    lastLogin: '2024-01-13T16:45:00Z',
    orders: 7,
    revenue: 425.00
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    role: 'user',
    status: 'active',
    lastLogin: '2024-01-15T11:20:00Z',
    orders: 15,
    revenue: 750.30
  }
];

// Generate more sample data for large dataset test
const generateLargeDataset = (count: number): SampleUser[] => {
  const roles: SampleUser['role'][] = ['admin', 'user', 'moderator'];
  const statuses: SampleUser['status'][] = ['active', 'inactive', 'pending'];
  const names = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'David', 'Emma', 'Frank', 'Grace', 'Henry'];
  const domains = ['example.com', 'test.com', 'demo.com'];

  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    name: `${names[i % names.length]} ${i + 1}`,
    email: `user${i + 1}@${domains[i % domains.length]}`,
    role: roles[i % roles.length],
    status: statuses[i % statuses.length],
    lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    orders: Math.floor(Math.random() * 50),
    revenue: Math.round((Math.random() * 3000 + 100) * 100) / 100
  }));
};

// Column definitions
const basicColumns: ColumnDefinition<SampleUser>[] = [
  {
    key: 'id',
    header: 'ID',
    sortable: true,
    width: '80px'
  },
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    filterable: true
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true,
    filterable: true
  },
  {
    key: 'role',
    header: 'Role',
    render: (value: string) => {
      const roleColors = {
        admin: 'bg-red-100 text-red-800',
        moderator: 'bg-blue-100 text-blue-800',
        user: 'bg-gray-100 text-gray-800'
      };
      return (
        <Badge className={roleColors[value as keyof typeof roleColors]}>
          {value}
        </Badge>
      );
    },
    sortable: true,
    filterable: true
  },
  {
    key: 'status',
    header: 'Status',
    render: (value: string) => {
      const statusColors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        pending: 'bg-yellow-100 text-yellow-800'
      };
      return (
        <Badge className={statusColors[value as keyof typeof statusColors]}>
          {value}
        </Badge>
      );
    },
    sortable: true,
    filterable: true
  }
];

const expandedColumns: ColumnDefinition<SampleUser>[] = [
  ...basicColumns,
  {
    key: 'orders',
    header: 'Orders',
    sortable: true,
    align: 'right',
    width: '100px'
  },
  {
    key: 'revenue',
    header: 'Revenue',
    render: (value: number) => `$${value.toFixed(2)}`,
    sortable: true,
    align: 'right',
    width: '120px'
  },
  {
    key: 'lastLogin',
    header: 'Last Login',
    render: (value: string) => new Date(value).toLocaleDateString(),
    sortable: true,
    width: '120px'
  },
  {
    key: 'actions',
    header: 'Actions',
    render: () => (
      <div className="flex space-x-2">
        <Button size="sm" variant="outline">
          Edit
        </Button>
        <Button size="sm" variant="destructive">
          Delete
        </Button>
      </div>
    ),
    width: '150px'
  }
];

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
  component: DataTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A powerful, feature-rich data table component with sorting, filtering, pagination, and row selection capabilities.'
      }
    }
  },
  argTypes: {
    data: {
      description: 'Array of data objects or Promise that resolves to data array',
      control: false
    },
    columns: {
      description: 'Array of column definitions',
      control: false
    },
    pagination: {
      description: 'Enable pagination',
      control: 'boolean'
    },
    selectable: {
      description: 'Enable row selection',
      control: 'boolean'
    },
    expandable: {
      description: 'Enable expandable rows',
      control: 'boolean'
    },
    loading: {
      description: 'Show loading state',
      control: 'boolean'
    },
    exportable: {
      description: 'Enable export functionality',
      control: 'boolean'
    },
    striped: {
      description: 'Add striped row styling',
      control: 'boolean'
    },
    hoverable: {
      description: 'Add hover effects',
      control: 'boolean'
    }
  }
};

export default meta;
type Story = StoryObj<typeof DataTable>;

// Basic Table Story
export const BasicTable: Story = {
  args: {
    data: sampleUsers,
    columns: basicColumns,
    pagination: true,
    striped: true,
    hoverable: true
  },
  parameters: {
    docs: {
      description: {
        story: 'A basic data table with sorting, filtering, and pagination.'
      }
    }
  }
};

// Table with Row Selection
export const WithRowSelection: Story = {
  args: {
    data: sampleUsers,
    columns: expandedColumns.filter(col => col.key !== 'actions'),
    selectable: true,
    exportable: true,
    exportFormats: ['csv', 'json']
  },
  parameters: {
    docs: {
      description: {
        story: 'Data table with row selection capabilities and export functionality.'
      }
    }
  }
};

// Table with Expandable Rows
export const WithExpandableRows: Story = {
  args: {
    data: sampleUsers,
    columns: basicColumns,
    expandable: true,
    maxHeight: '400px'
  },
  parameters: {
    docs: {
      description: {
        story: 'Data table with expandable rows for showing additional details.'
      }
    }
  }
};

// Large Dataset Table
export const LargeDataset: Story = {
  args: {
    data: generateLargeDataset(1000),
    columns: expandedColumns,
    pagination: true,
    selectable: true,
    defaultPageSize: 50,
    pageSizeOptions: [25, 50, 100, 200]
  },
  parameters: {
    docs: {
      description: {
        story: 'Data table handling a large dataset with 1000+ rows, demonstrating performance with virtualization.'
      }
    }
  }
};

// Server-side Data Table
export const ServerSideData: Story = {
  args: {
    data: Promise.resolve(sampleUsers),
    columns: expandedColumns,
    serverSide: true,
    loading: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Data table configured for server-side data fetching and processing.'
      }
    }
  }
};

// Loading State
export const LoadingState: Story = {
  args: {
    data: sampleUsers,
    columns: basicColumns,
    loading: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Data table in loading state with skeleton loader.'
      }
    }
  }
};

// Empty State
export const EmptyState: Story = {
  args: {
    data: [],
    columns: basicColumns,
    pagination: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Data table with no data, showing empty state.'
      }
    }
  }
};

// Error State
export const ErrorState: Story = {
  args: {
    data: sampleUsers,
    columns: basicColumns,
    error: 'Failed to load data. Please try again.'
  },
  parameters: {
    docs: {
      description: {
        story: 'Data table in error state with retry functionality.'
      }
    }
  }
};

// Custom Empty State
export const CustomEmptyState: Story = {
  args: {
    data: [],
    columns: basicColumns,
    emptyState: (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-500 mb-4">Start by creating your first order</p>
        <Button>Create Order</Button>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Data table with custom empty state component.'
      }
    }
  }
};

// Compact Table
export const CompactTable: Story = {
  args: {
    data: sampleUsers,
    columns: basicColumns.map(col => ({
      ...col,
      cellClassName: 'py-2 text-xs'
    })),
    pagination: false,
    striped: false,
    className: 'text-sm'
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact data table with reduced padding and smaller text.'
      }
    }
  }
};

// Interactive Story with Controls
export const InteractiveExample: Story = {
  args: {
    data: sampleUsers,
    columns: expandedColumns,
    pagination: true,
    selectable: true,
    expandable: true,
    exportable: true,
    striped: true,
    hoverable: true,
    defaultPageSize: 10,
    stickyHeader: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive example with all features enabled. Use the controls panel to experiment with different configurations.'
      }
    }
  }
};
