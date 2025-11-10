import Link from 'next/link';
import { CalendarIcon, MapPinIcon, PhoneIcon, TagIcon } from '@heroicons/react/24/outline';
import { PencilLineIcon } from 'lucide-react';

import type { LostItem } from '@/types/lost';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    badgeVariant: 'default' | 'secondary' | 'outline';
  }
> = {
  lost: { label: 'ยังตามหา', badgeVariant: 'default' },
  found: { label: 'พบแล้ว', badgeVariant: 'secondary' },
  returned: { label: 'ส่งคืนแล้ว', badgeVariant: 'default' },
};

interface LostItemCardProps {
  item: LostItem;
  onEdit?: (item: LostItem) => void;
  className?: string;
}

export function LostItemCard({ item, onEdit, className }: LostItemCardProps) {
  const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.lost;
  const tags = item.tags?.filter(Boolean) ?? [];

  return (
    <Card className={cn('relative flex h-full flex-col shadow-lg transition-shadow hover:shadow-xl', className)}>
      <CardHeader className="space-y-3 pb-0">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">{item.title}</CardTitle>
            <Badge variant={status.badgeVariant} className="uppercase">
              {status.label}
            </Badge>
          </div>

          {item.imageUrl ? (
            <div className="hidden h-16 w-16 overflow-hidden rounded-lg border border-border bg-muted/20 sm:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
            </div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="text-sm text-muted-foreground">{item.description}</p>

        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          {item.location ? (
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4" />
              <span>{item.location}</span>
            </div>
          ) : null}

          {item.reportedAt ? (
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>{new Date(item.reportedAt).toLocaleDateString('th-TH')}</span>
            </div>
          ) : null}

          {item.contactPhone ? (
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4" />
              <span>{item.contactPhone}</span>
            </div>
          ) : null}
        </div>

        {tags.length ? (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <TagIcon className="h-4 w-4 text-muted-foreground" />
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="rounded-full px-2 py-0 text-xs uppercase">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          อัปเดตล่าสุด {item.updatedAt ? new Date(item.updatedAt).toLocaleString('th-TH') : '-'}
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/losts/${item.id}`}>
              ดูรายละเอียด
            </Link>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={() => onEdit?.(item)}
          >
            <PencilLineIcon className="h-4 w-4" />
            แก้ไข
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}


