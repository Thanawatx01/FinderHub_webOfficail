import { LostItemEditor } from '@/components/admin/losts/lost-item-editor';

interface LostItemUpdatePageProps {
  params: {
    id: string;
  };
}

export default function LostItemUpdatePage({ params }: LostItemUpdatePageProps) {
  return <LostItemEditor itemId={params.id} />;
}


