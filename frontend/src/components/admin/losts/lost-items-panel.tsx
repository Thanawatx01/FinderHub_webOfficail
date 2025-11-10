'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { AxiosError } from 'axios';
import { PlusIcon, SearchIcon } from 'lucide-react';

import apiClient from '@/lib/api-client';
import { clearAuthToken } from '@/lib/token';
import type { LostItem, LostItemStatus } from '@/types/lost';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LostItemCard } from '@/components/admin/losts/lost-item-card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_FILTERS: Array<{ value: 'all' | LostItemStatus; label: string }> = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'lost', label: 'ยังตามหา' },
  { value: 'found', label: 'พบแล้ว' },
  { value: 'returned', label: 'ส่งคืนแล้ว' },
];

export function LostItemsPanel() {
  const router = useRouter();
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LostItemStatus>('all');

  useEffect(() => {
    let active = true;

    async function loadLostItems() {
      try {
        const response = await apiClient.get<{ items: LostItem[] }>('/lost-items');
        if (!active) return;
        setItems(response.data.items ?? []);
      } catch (error) {
        if (!active) return;
        const axiosError = error as AxiosError<{ message?: string }>;
        if (axiosError.response?.status === 401) {
          clearAuthToken();
          router.replace('/login');
          return;
        }
        setErrorMessage(
          axiosError.response?.data?.message || 'ไม่สามารถดึงข้อมูลประกาศของหายได้ในขณะนี้',
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadLostItems();

    return () => {
      active = false;
    };
  }, [router]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesQuery =
        !query ||
        [item.title, item.description, item.location, item.tags?.join(' ')]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query.trim().toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [items, query, statusFilter]);

  const handleEdit = (item: LostItem) => {
    router.push(`/admin/losts/update/${item.id}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">จัดการประกาศของหาย</h1>
          <p className="text-muted-foreground">
            ตรวจสอบ แก้ไข หรือเพิ่มประกาศใหม่สำหรับของที่สูญหายในระบบ FinderHub
          </p>
        </div>
        <Button asChild size="lg" className="gap-2 self-start sm:self-auto">
          <Link href="/admin/losts/create">
            <PlusIcon className="h-4 w-4" />
            เพิ่มประกาศใหม่
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card/40 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-dashed border-border bg-background px-3 py-2 shadow-inner">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาจากชื่อ รายละเอียด หรือสถานที่..."
            className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="flex items-center gap-3">
          <Label htmlFor="lost-status" className="text-sm font-medium text-muted-foreground">
            สถานะ
          </Label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | LostItemStatus)}>
            <SelectTrigger id="lost-status" className="w-[160px] text-sm">
              <SelectValue placeholder="เลือกสถานะ" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((status) => (
                <SelectItem key={status.value} value={status.value} className="text-sm">
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <LostItemsSkeleton />
      ) : errorMessage ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : filteredItems.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <LostItemCard key={item.id} item={item} onEdit={handleEdit} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card/50 p-10 text-center text-sm text-muted-foreground shadow-sm">
          ยังไม่มีประกาศของหายในระบบ
        </div>
      )}
    </div>
  );
}

function LostItemsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-[320px] rounded-2xl" />
      ))}
    </div>
  );
}


