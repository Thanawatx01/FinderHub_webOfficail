'use client';

import { use } from 'react';

import { LostItemPreview } from '@/components/admin/losts/lost-item-preview';

interface LostItemDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function LostItemDetailPage({ params }: LostItemDetailPageProps) {
  const resolvedParams = use(params);

  return <LostItemPreview itemId={resolvedParams.id} />;
}


