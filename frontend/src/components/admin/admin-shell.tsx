'use client';

import React, { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import { Loader2 } from 'lucide-react';

import type { AuthUser } from '@/types/auth';
import apiClient from '@/lib/api-client';
import { clearAuthToken } from '@/lib/token';
import { ModeToggle } from '@/components/mode-toggle';
import { Badge } from '@/components/ui/badge';
import { ADMIN_NAV_LABELS, BackSidebar } from '@/components/back-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const hasHandledUnauthorized = useRef(false);

  useEffect(() => {
    let active = true;

    async function fetchCurrentUser() {
      try {
        const response = await apiClient.get<{ user: AuthUser }>('/auth/me');
        if (!active) return;
        setUser(response.data.user);
      } catch {
        if (!active || hasHandledUnauthorized.current) return;
        hasHandledUnauthorized.current = true;

        clearAuthToken();

        await Swal.fire({
          icon: 'warning',
          title: 'เซสชันหมดอายุ',
          text: 'กรุณาเข้าสู่ระบบอีกครั้ง',
          confirmButtonText: 'ไปหน้าเข้าสู่ระบบ',
        });

        router.replace('/login');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchCurrentUser();

    return () => {
      active = false;
    };
  }, [router]);

  const breadcrumbs = useMemo(() => {
    const segments = pathname.replace(/^\//, '').split('/').filter(Boolean);
    const adminIndex = segments.indexOf('admin');
    const relevant = adminIndex >= 0 ? segments.slice(adminIndex) : segments;

    const items = relevant.map((segment, index) => {
      const fullSegment = relevant.slice(0, index + 1).join('/');
      const href = '/' + fullSegment;
      const label =
        ADMIN_NAV_LABELS[fullSegment] ??
        (segment === 'admin' ? 'แดชบอร์ด' : segment.replace(/-/g, ' '));
      return { label, href, isLast: index === relevant.length - 1 };
    });

    if (!items.length) {
      return [{ label: 'แดชบอร์ด', href: '/admin', isLast: true }];
    }

    return items;
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground w-full">
        <BackSidebar />
        <div className="flex flex-1 flex-col">
          <header className="border-b border-border bg-card/30 backdrop-blur">
            <div className="flex w-full items-center justify-between gap-4 px-6 py-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-8 w-8" />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheckIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold leading-none">FinderHub Admin</p>
                  <Breadcrumb className="text-xs text-muted-foreground">
                    <BreadcrumbList>
                      {breadcrumbs.map((item, index) => (
                        <React.Fragment key={item.href}>
                          <BreadcrumbItem>
                            {item.isLast ? (
                              <BreadcrumbPage className="capitalize">{item.label}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink asChild className="capitalize hover:text-primary">
                                <Link href={item.href}>{item.label}</Link>
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                          {index < breadcrumbs.length - 1 ? <BreadcrumbSeparator /> : null}
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 text-right text-sm sm:flex">
                  <div className="font-medium">{user.name || user.email}</div>
                  <Badge variant="outline" className="uppercase tracking-wide">
                    {user.role}
                  </Badge>
                </div>
                <ModeToggle />
              </div>
            </div>
          </header>

          <div className="flex-1 px-6 py-8 sm:px-8 lg:px-10">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

