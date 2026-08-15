import { defineCollection, z } from 'astro:content';

// Astro 4 content collections (legacy `type: 'content'`). Astro
// auto-derives a slug from the filename (`<name>.md`), which keeps the
// leading `YYYY-MM-DD-` date — we strip it via `postSlug()` below
// when generating routes, so URLs stay compatible with the old
// Jekyll `permalink: blog/:title/`.
const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // z.coerce.date() tolerates historical front-matter formats like
    // `date: 2014-11-8` (single-digit month/day) without build errors.
    date: z.coerce.date(),
    description: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };

/** Strip leading `YYYY-MM-DD-` (or `YYYY-M-D-`) to recover the legacy
 * Jekyll title slug. Exported so route + components share one canonical
 * implementation. */
export function postSlug(post: { id?: string; slug?: string }): string {
  return (post.slug ?? post.id ?? '').replace(/^\d{4}-\d{1,2}-\d{1,2}-/, '');
}
