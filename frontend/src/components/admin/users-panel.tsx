'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AxiosError } from 'axios';

import apiClient from '@/lib/api-client';
import { clearAuthToken } from '@/lib/token';
import type { AuthUser } from '@/types/auth';
import { UsersTable } from '@/components/admin/users-table';

interface AdminUser extends AuthUser {
  createdAt?: string;
}

export function UsersPanel() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        const response = await apiClient.get<{ users: AdminUser[] }>('/auth/users');
        if (!active) return;
        setUsers(response.data.users ?? []);
      } catch (error) {
        if (!active) return;
        const axiosError = error as AxiosError<{ message?: string }>;
        if (axiosError.response?.status === 401) {
          clearAuthToken();
          router.replace('/login');
          return;
        }

        setErrorMessage(
          axiosError.response?.data?.message || 'ไม่สามารถดึงข้อมูลผู้ใช้ได้ในขณะนี้'
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        กำลังโหลดข้อมูลผู้ใช้งาน...
      </div>
    );
  }

  return <UsersTable data={users} errorMessage={errorMessage} />;
}

