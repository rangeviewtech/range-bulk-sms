import { describe, it, expect } from 'vitest';
import { RANGE_NAVIGATION } from '@/components/layout/range-sidebar';
import { navConfig } from '@/config/navigation';

describe('Draft Messages Navigation Configuration', () => {
  it('registers Draft Messages in RANGE_NAVIGATION under SMS -> Messaging', () => {
    const smsModule = RANGE_NAVIGATION.find((m) => m.title === 'SMS');
    expect(smsModule).toBeDefined();

    const messagingCategory = smsModule?.categories?.find((c) => c.title === 'Messaging');
    expect(messagingCategory).toBeDefined();

    const draftItem = messagingCategory?.items.find((item) => item.href === '/sms/drafts');
    expect(draftItem).toBeDefined();
    expect(draftItem?.title).toBe('Draft Messages');
  });

  it('registers Draft Messages in navConfig under SMS group', () => {
    const smsGroup = navConfig.find((g) => g.title === 'SMS');
    expect(smsGroup).toBeDefined();

    const draftItem = smsGroup?.items.find((item) => item.href === '/sms/drafts');
    expect(draftItem).toBeDefined();
    expect(draftItem?.title).toBe('Draft Messages');
    expect(draftItem?.icon).toBe('FileEdit');
  });

  it('preserves sibling items under SMS -> Messaging', () => {
    const smsModule = RANGE_NAVIGATION.find((m) => m.title === 'SMS');
    const messagingCategory = smsModule?.categories?.find((c) => c.title === 'Messaging');
    const hrefs = messagingCategory?.items.map((i) => i.href);

    expect(hrefs).toContain('/sms/send');
    expect(hrefs).toContain('/sms/drafts');
    expect(hrefs).toContain('/sms/scheduled');
    expect(hrefs).toContain('/sms/custom');
  });
});
