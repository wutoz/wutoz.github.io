import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { postSlug } from '../content/config';

// Hand-rolled static sitemap. Avoids the @astrojs/sitemap integration which
// requires an `astro:routes:resolved` hook that doesn't exist in Astro 4.x.
// For ~15 posts + a handful of static pages, this is simpler and version-safe.

type Entry = { loc: string; lastmod?: string; changefreq?: string; priority?: number };

const STATIC_PAGES: Entry[] = [
  { loc: '/',          changefreq: 'weekly',  priority: 1.0 },
  { loc: '/about/',    changefreq: 'monthly', priority: 0.6 },
  { loc: '/contact/',  changefreq: 'yearly',  priority: 0.4 },
];

function esc(s: string): string {
  // Sitemap XML spec requires escaping '&', '<', '>', "'", '"'.
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(context: APIContext) {
  const site = context.site!.toString().replace(/\/$/, '');
  const posts = await getCollection('posts', ({ data }) => !data.draft);

  const postEntries: Entry[] = posts.map((p) => ({
    loc: `/blog/${postSlug(p)}/`,
    lastmod: p.data.date.toISOString().slice(0, 10),
    changefreq: 'yearly',
    priority: 0.7,
  }));

  const all = [...STATIC_PAGES, ...postEntries];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all
  .map(
    (e) => `  <url>
    <loc>${esc(site + e.loc)}</loc>${
      e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ''
    }${e.changefreq ? `\n    <changefreq>${e.changefreq}</changefreq>` : ''}${
      e.priority != null ? `\n    <priority>${e.priority.toFixed(1)}</priority>` : ''
    }
  </url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
