import { describe, expect, it } from 'vitest';

import { PublishStatus } from '@/generated/prisma';
import { assertPublishable, resolvePublishStatus, UnsourcedContentError } from '@/lib/publish';

/**
 * These tests are the enforcement of the build plan's central guardrail:
 * "Sourced or it doesn't ship." They run against a fake citation table rather than
 * a real database, so the invariant is checked on every run, not only when a DB
 * happens to be configured.
 */

function fakeClientWithPrimaryCitations(count: number) {
  return {
    citation: {
      count: async () => count,
    },
  };
}

describe('assertPublishable', () => {
  it('throws when a gated field has no primary citation', async () => {
    const client = fakeClientWithPrimaryCitations(0);
    await expect(assertPublishable(client, 'LAW', 'law_1')).rejects.toThrow(UnsourcedContentError);
  });

  it('passes when a gated field has at least one primary citation', async () => {
    const client = fakeClientWithPrimaryCitations(1);
    await expect(assertPublishable(client, 'LAW', 'law_1')).resolves.toBeUndefined();
  });
});

describe('resolvePublishStatus', () => {
  it('never returns PUBLISHED for an unsourced fact', async () => {
    const client = fakeClientWithPrimaryCitations(0);
    await expect(
      resolvePublishStatus(client, 'RIGHT', 'right_1', PublishStatus.PUBLISHED),
    ).rejects.toThrow(UnsourcedContentError);
  });

  it('allows DRAFT and IN_REVIEW regardless of citations', async () => {
    const client = fakeClientWithPrimaryCitations(0);
    await expect(
      resolvePublishStatus(client, 'RIGHT', 'right_1', PublishStatus.DRAFT),
    ).resolves.toBe(PublishStatus.DRAFT);
    await expect(
      resolvePublishStatus(client, 'RIGHT', 'right_1', PublishStatus.IN_REVIEW),
    ).resolves.toBe(PublishStatus.IN_REVIEW);
  });

  it('allows PUBLISHED once a primary citation exists', async () => {
    const client = fakeClientWithPrimaryCitations(1);
    await expect(
      resolvePublishStatus(client, 'RIGHT', 'right_1', PublishStatus.PUBLISHED),
    ).resolves.toBe(PublishStatus.PUBLISHED);
  });

  it('does not count a secondary-only citation toward the gate', async () => {
    // The fake here simulates the real query: it filters on isPrimary, so a
    // secondary-only citation set must produce a count of 0, not 1.
    const client = {
      citation: {
        count: async ({ where }: { where: { isPrimary?: boolean } }) =>
          where.isPrimary === true ? 0 : 1,
      },
    };
    await expect(assertPublishable(client, 'LAW', 'law_2')).rejects.toThrow(
      UnsourcedContentError,
    );
  });
});
