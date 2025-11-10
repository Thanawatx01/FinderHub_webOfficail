import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChartBarIcon, UserGroupIcon, Cog6ToothIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { LogoutButton } from './logout-button';

export interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  exact?: boolean;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: '/admin',
    label: 'แดชบอร์ด',
    icon: ChartBarIcon,
    exact: true,
  },
  {
    href: '/admin/losts',
    label: 'รายการสูญหาย',
    icon: MagnifyingGlassIcon,
  },
  {
    href: '/admin/users',
    label: 'ผู้ใช้งาน',
    icon: UserGroupIcon,
  },
  {
    href: '/admin/settings',
    label: 'ตั้งค่า',
    icon: Cog6ToothIcon,
  },
];

export const ADMIN_NAV_LABELS = ADMIN_NAV_ITEMS.reduce<Record<string, string>>((labels, item) => {
  const key = item.href.replace(/^\//, '');
  labels[key] = item.label;
  return labels;
}, {});

export function BackSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="px-5 py-6">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">FinderHub</p>
          <p className="text-lg font-semibold">Admin Panel</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-3 py-2">
          <SidebarMenu>
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.href} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-5 py-6">
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}