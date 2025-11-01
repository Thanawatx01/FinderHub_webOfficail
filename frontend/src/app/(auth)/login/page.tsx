'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { ShieldCheckIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import apiClient from '@/lib/api-client';
import { getAuthToken, setAuthToken } from '@/lib/token';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ModeToggle } from '@/components/mode-toggle';

interface LoginFormState {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formState, setFormState] = useState<LoginFormState>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (getAuthToken()) {
      router.replace(DEFAULT_LOGIN_REDIRECT);
    }
  }, [router]);

  const canSubmit = useMemo(() => formState.email.trim() && formState.password.trim(), [formState]);

  const handleChange = (field: keyof LoginFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        email: formState.email.trim(),
        password: formState.password,
      });

      const token = response.data?.token;
      if (!token) {
        throw new Error('Token was not provided by the server');
      }

      setAuthToken(token);

      await Swal.fire({
        icon: 'success',
        title: 'เข้าสู่ระบบสำเร็จ',
        confirmButtonText: 'ไปที่แดชบอร์ด',
        timer: 1500,
        timerProgressBar: true,
      });

      router.push(DEFAULT_LOGIN_REDIRECT);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลหรือรหัสผ่าน';

      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถเข้าสู่ระบบได้',
        text: message,
        confirmButtonText: 'ลองอีกครั้ง',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <ShieldCheckIcon className="h-6 w-6" />
            <span>FinderHub Admin</span>
          </div>
          <ModeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <LockClosedIcon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">เข้าสู่ระบบผู้ดูแล</CardTitle>
              <CardDescription>กรุณาเข้าสู่ระบบเพื่อจัดการระบบ FinderHub</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={formState.email}
                    onChange={handleChange('email')}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">รหัสผ่าน</Label>
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary"
                    >
                      {showPassword ? (
                        <>
                          <EyeSlashIcon className="h-4 w-4" /> ซ่อนรหัสผ่าน
                        </>
                      ) : (
                        <>
                          <EyeIcon className="h-4 w-4" /> แสดงรหัสผ่าน
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formState.password}
                      onChange={handleChange('password')}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={!canSubmit || loading}>
                  {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                ต้องการกลับหน้าแรกใช่หรือไม่?{' '}
                <Link href="/" className="font-medium text-primary hover:underline">
                  กลับสู่หน้าหลัก
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

