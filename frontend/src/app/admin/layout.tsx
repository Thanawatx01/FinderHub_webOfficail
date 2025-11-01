import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE } from '@/lib/constants';
import { AdminShell } from '@/components/admin/admin-shell';

export const metadata: Metadata = {
  title: 'FinderHub | Admin Dashboard',
  description: 'Manage FinderHub data and users from the administrative dashboard.',
};

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect('/login');
  }

  return <AdminShell>{children}</AdminShell>;
}
