export interface SmsDraft {
  id: string;
  userId: string;
  organizationId: string | null;
  title: string;
  senderId: string | null;
  deliveryMode: string;
  message: string;
  manualRecipients: string;
  recipientCount: number;
  selectedGroupId: string | null;
  importFilename: string | null;
  importRowCount: number | null;
  templateId: string | null;
  metadata: Record<string, unknown> | null;
  version: number;
  isShared: boolean;
  lastEditedById: string | null;
  lastAutosavedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export interface SmsDraftFormData {
  senderId: string;
  deliveryMode: string;
  manualRecipients: string;
  message: string;
  recipientCount?: number;
  selectedGroupId?: string | null;
  importFilename?: string | null;
  importRowCount?: number | null;
  templateId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export type DraftSaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'conflict';
