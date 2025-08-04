'use client';

import { TableLayoutDesigner } from '@/components/TableLayoutDesigner';

export default function TableLayoutPage() {
  return (
    <div className="h-screen bg-gray-50">
      <div className="h-full mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Table Layout Designer
        </h1>
        <TableLayoutDesigner />
      </div>
    </div>
  );
} 