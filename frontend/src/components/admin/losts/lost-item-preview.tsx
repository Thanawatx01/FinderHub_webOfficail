'use client';

import { useEffect, useState } from 'react';
import { CalendarIcon, MapPinIcon, PhoneIcon, TagIcon } from '@heroicons/react/24/outline';
import type { AxiosError } from 'axios';

import apiClient from '@/lib/api-client';
import { clearAuthToken } from '@/lib/token';
import type { LostItem } from '@/types/lost';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

interface LostItemPreviewProps {
  itemId: string;
}

const STATUS_LABEL: Record<string, string> = {
  lost: 'ยังตามหา',
  found: 'พบแล้ว',
  returned: 'ส่งคืนแล้ว',
};

export function LostItemPreview({ itemId }: LostItemPreviewProps) {
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
          axiosError.response?.data?.message || 'ไม่สามารถโหลดรายละเอียดประกาศได้ในขณะนี้',
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
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-[320px] rounded-2xl" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <Card className="mx-auto max-w-2xl border-destructive/40 bg-destructive/10 text-destructive shadow">
        <CardHeader>
          <CardTitle>เกิดข้อผิดพลาด</CardTitle>
          <CardDescription className="text-destructive">{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" onClick={() => router.back()}>
            กลับ
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!item) {
    return null;
  }

  const tags = item.tags?.filter(Boolean) ?? [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{item.title}</h1>
        <p className="text-sm text-muted-foreground">
          อัปเดตล่าสุด{' '}
          {item.updatedAt ? new Date(item.updatedAt).toLocaleString('th-TH') : 'ไม่ทราบ'}
        </p>
      </div>

      <Card className="overflow-hidden shadow-lg">
        {item.imageUrl ? (
          <div className="h-64 w-full bg-muted/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-full w-full object-cover object-center"
            />
          </div>
        ) : null}

        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="uppercase">
              {STATUS_LABEL[item.status] ?? item.status}
            </Badge>
            {item.reportedAt ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>{new Date(item.reportedAt).toLocaleDateString('th-TH')}</span>
              </div>
            ) : null}
          </div>

          <CardTitle className="text-2xl">{item.title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{item.description}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            {item.location ? (
              <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm">
                <MapPinIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">สถานที่</p>
                  <p className="text-muted-foreground">{item.location}</p>
                </div>
              </div>
            ) : null}

            {item.contactPhone || item.contactName ? (
              <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm">
                <PhoneIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">ข้อมูลติดต่อ</p>
                  <p className="text-muted-foreground">
                    {item.contactName ? `${item.contactName} • ` : ''}
                    {item.contactPhone ?? '-'}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {tags.length ? (
            <div className="flex flex-wrap items-center gap-2">
              <TagIcon className="h-4 w-4 text-muted-foreground" />
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-full px-3 py-1 text-xs uppercase">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          ย้อนกลับ
        </Button>
        <Button
          variant="default"
          onClick={() => router.push(`/admin/losts/update/${item.id}`)}
        >
          แก้ไขประกาศนี้
        </Button>
      </div>
    </div>
  );
}


