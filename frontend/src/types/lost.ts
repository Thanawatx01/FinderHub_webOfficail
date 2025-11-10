export type LostItemStatus = 'lost' | 'found' | 'returned';

export interface LostItem {
  id: string;
  title: string;
  description: string;
  status: LostItemStatus;
  location?: string | null;
  imageUrl?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  tags?: string[] | null;
  reportedAt: string;
  updatedAt?: string;
}

export interface LostItemPayload
  extends Pick<
    LostItem,
    'title' | 'description' | 'status' | 'location' | 'imageUrl' | 'contactName' | 'contactPhone'
  > {
  tags?: string[];
  reportedAt?: string;
}


