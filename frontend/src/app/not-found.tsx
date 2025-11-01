"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HouseIcon, ArrowLeftIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 text-center text-foreground">
      <div className="space-y-6">
        <p className="text-sm font-medium text-muted-foreground">404 | ไม่พบหน้าที่ค้นหา</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">ไม่พบหน้าเพจนี้</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          ขออภัย ไม่พบหน้าที่คุณต้องการ อาจถูกลบ ย้าย หรือ URL ไม่ถูกต้อง
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">
              <HouseIcon className="mr-2 h-4 w-4" />
              กลับหน้าหลัก
            </Link>
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            ย้อนกลับ
          </Button>
        </div>
      </div>
    </main>
  );
}

