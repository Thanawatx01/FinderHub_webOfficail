'use client';

import { useEffect, useState } from 'react';
import type { AxiosError } from 'axios';

import apiClient from '@/lib/api-client';
import { clearAuthToken } from '@/lib/token';
import type { LostItem } from '@/types/lost';
import { LostItemForm } from '@/components/admin/losts/lost-item-form';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LostItemEditorProps {
  itemId: string;
}

export function LostItemEditor({ itemId }: LostItemEditorProps) {
  const router = useRouter();
  const [item, setItem] = useState<LostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadItem() {
      try {
        const response = await apiClient.get<{ item: LostItem }>(`/lost-items/${itemId}`);
        if (!active) return;
        setItem(response.data.item);
      } catch (error) {
        if (!active) return;
        const axiosError = error as AxiosError<{ message?: string }>;
        if (axiosError.response?.status === 401) {
          clearAuthToken();
          router.replace('/login');
          return;
        }
        setErrorMessage(
          axiosError.response?.data?.message || 'ไม่สามารถดึงข้อมูลประกาศนี้ได้ในขณะนี้',
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadItem();

    return () => {
      active = false;
    };
  }, [itemId, router]);

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 rounded-lg bg-muted" />
          <div className="h-[480px] w-[640px] rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <Card className="mx-auto max-w-2xl border-destructive/40 bg-destructive/10 text-destructive shadow-md">
        <CardHeader>
          <CardTitle>เกิดข้อผิดพลาด</CardTitle>
          <CardDescription className="text-destructive">
            ไม่สามารถโหลดรายละเอียดประกาศได้
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{errorMessage}</p>
          <Button variant="secondary" onClick={() => router.replace('/admin/losts')}>
            กลับไปหน้ารายการประกาศ
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!item) {
    return null;
  }

  return <LostItemForm mode="edit" itemId={itemId} initialData={item} />;
}


