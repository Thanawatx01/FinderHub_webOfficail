'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import type { AxiosError } from 'axios';

import apiClient from '@/lib/api-client';
import { clearAuthToken } from '@/lib/token';
import type { LostItem, LostItemPayload, LostItemStatus } from '@/types/lost';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const STATUS_OPTIONS: { value: LostItemStatus; label: string }[] = [
  { value: 'lost', label: 'ยังตามหา' },
  { value: 'found', label: 'พบแล้ว' },
  { value: 'returned', label: 'ส่งคืนแล้ว' },
];

export interface LostItemFormProps {
  mode: 'create' | 'edit';
  itemId?: string;
  initialData?: Partial<LostItem>;
}

export function LostItemForm({ mode, itemId, initialData }: LostItemFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [formState, setFormState] = useState(() => ({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    status: (initialData?.status as LostItemStatus) ?? 'lost',
    location: initialData?.location ?? '',
    reportedAt: initialData?.reportedAt ? initialData.reportedAt.slice(0, 10) : '',
    contactName: initialData?.contactName ?? '',
    contactPhone: initialData?.contactPhone ?? '',
    imageUrl: initialData?.imageUrl ?? '',
    tags: initialData?.tags?.join(', ') ?? '',
  }));

  const pageTitle = mode === 'create' ? 'เพิ่มประกาศของหาย' : 'แก้ไขประกาศของหาย';
  const pageDescription =
    mode === 'create'
      ? 'กรอกข้อมูลรายละเอียดของหายเพื่อเผยแพร่ให้ผู้ใช้งานช่วยเหลือในการตามหา'
      : 'ปรับปรุงข้อมูลประกาศของหายที่เผยแพร่ไปแล้ว';

  const submitLabel = mode === 'create' ? 'บันทึกประกาศ' : 'บันทึกการแก้ไข';

  const isEditMode = mode === 'edit';

  const parsedTags = useMemo(() => {
    return formState.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [formState.tags]);

  const handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  > = (event) => {
    const { name, value } = event.target;
    setFormState((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleStatusChange = (value: LostItemStatus) => {
    setFormState((previous) => ({
      ...previous,
      status: value,
    }));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setServerError(null);

    const payload: LostItemPayload = {
      title: formState.title,
      description: formState.description,
      status: formState.status,
      location: formState.location || undefined,
      reportedAt: formState.reportedAt || undefined,
      contactName: formState.contactName || undefined,
      contactPhone: formState.contactPhone || undefined,
      imageUrl: formState.imageUrl || undefined,
      tags: parsedTags,
    };

    try {
      if (isEditMode && itemId) {
        await apiClient.put(`/lost-items/${itemId}`, payload);
      } else {
        await apiClient.post('/lost-items', payload);
      }

      await Swal.fire({
        icon: 'success',
        title: mode === 'create' ? 'เพิ่มประกาศสำเร็จ' : 'บันทึกการแก้ไขแล้ว',
        text: 'ระบบจะนำคุณกลับไปยังหน้ารายการประกาศ',
        confirmButtonText: 'ตกลง',
      });
      router.push('/admin/losts');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      if (axiosError.response?.status === 401) {
        clearAuthToken();
        router.replace('/login');
        return;
      }

      const message = axiosError.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองอีกครั้ง';
      setServerError(message);
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: message,
        confirmButtonText: 'ลองอีกครั้ง',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{pageTitle}</CardTitle>
          <CardDescription>{pageDescription}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="title">ชื่อประกาศ *</Label>
              <Input
                id="title"
                name="title"
                required
                value={formState.title}
                onChange={handleChange}
                placeholder="เช่น กระเป๋าสตางค์สีดำหายที่ตึก A"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="description">รายละเอียด *</Label>
              <Textarea
                id="description"
                name="description"
                required
                value={formState.description}
                onChange={handleChange}
                placeholder="อธิบายรายละเอียดของที่สูญหาย จุดสังเกต หรือข้อมูลเพิ่มเติม"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">สถานะ</Label>
              <Select value={formState.status} onValueChange={handleStatusChange}>
                <SelectTrigger id="status" className="text-sm">
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-sm">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportedAt">วันที่ประกาศ</Label>
              <Input
                id="reportedAt"
                name="reportedAt"
                type="date"
                value={formState.reportedAt}
                onChange={handleChange}
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="location">สถานที่</Label>
              <Input
                id="location"
                name="location"
                value={formState.location}
                onChange={handleChange}
                placeholder="ระบุสถานที่ที่คาดว่าเกิดการสูญหาย"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactName">ชื่อผู้ติดต่อ</Label>
              <Input
                id="contactName"
                name="contactName"
                value={formState.contactName}
                onChange={handleChange}
                placeholder="ชื่อผู้รายงานหรือผู้ติดต่อ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">เบอร์โทรผู้ติดต่อ</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                value={formState.contactPhone}
                onChange={handleChange}
                placeholder="เช่น 080-000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">ลิงก์รูปภาพ</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formState.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
                type="url"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="tags">แท็ก</Label>
              <Input
                id="tags"
                name="tags"
                value={formState.tags}
                onChange={handleChange}
                placeholder="เช่น กระเป๋า, เงินสด, ด่วน"
              />
              <p className="text-xs text-muted-foreground">คั่นแต่ละแท็กด้วยเครื่องหมายจุลภาค (,)</p>
            </div>
          </div>

          {serverError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
            ย้อนกลับ
          </Button>
          <Button type="submit" disabled={submitting} className="min-w-[140px]">
            {submitting ? 'กำลังบันทึก...' : submitLabel}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}


