'use client';

import { useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import type { AuthUser } from '@/types/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface UsersTableProps {
  data: Array<AuthUser & { createdAt?: string }>;
  errorMessage?: string | null;
}

const columns: ColumnDef<AuthUser & { createdAt?: string }>[] = [
  {
    accessorKey: 'email',
    header: 'อีเมล',
    cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
  },
  {
    accessorKey: 'name',
    header: 'ชื่อผู้ใช้',
    cell: ({ getValue }) => getValue<string>() || '—',
  },
  {
    accessorKey: 'role',
    header: 'สิทธิ์การใช้งาน',
    cell: ({ getValue }) => (
      <Badge variant="outline" className="uppercase">
        {getValue<string>()}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'วันที่สร้าง',
    cell: ({ getValue }) => {
      const value = getValue<string | undefined>();
      if (!value) {
        return '—';
      }
      try {
        const date = new Date(value);
        return new Intl.DateTimeFormat('th-TH', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(date);
      } catch {
        return value;
      }
    },
  },
];

export function UsersTable({ data, errorMessage }: UsersTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const emptyState = useMemo(() => !data.length && !errorMessage, [data.length, errorMessage]);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}

          {errorMessage ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-destructive">
                {errorMessage}
              </TableCell>
            </TableRow>
          ) : null}

          {emptyState ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-muted-foreground">
                ยังไม่มีข้อมูลผู้ใช้งาน
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}

