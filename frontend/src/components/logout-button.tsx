'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

import apiClient from '@/lib/api-client';
import { clearAuthToken } from '@/lib/token';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Logout request failed', error);
    } finally {
      clearAuthToken();
      setLoading(false);
    }

    await Swal.fire({
      icon: 'success',
      title: 'ออกจากระบบสำเร็จ',
      timer: 1200,
      showConfirmButton: false,
    });

    router.push('/login');
  };

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} disabled={loading}>
      {loading ? 'กำลังออก...' : 'ออกจากระบบ'}
    </Button>
  );
}

