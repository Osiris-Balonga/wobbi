// @vitest-environment node

import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const readProjectFile = (path, encoding = 'utf8') =>
  readFile(new URL(`../../${path}`, import.meta.url), encoding);

describe('public discovery metadata', () => {
  it('publishes canonical, social and structured metadata', async () => {
    const html = await readProjectFile('index.html');

    expect(html).toContain(
      '<link rel="canonical" href="https://wobbi.vercel.app/" />',
    );
    expect(html).toMatch(
      /property="og:image"\s+content="https:\/\/wobbi\.vercel\.app\/og-wobbi\.png"/,
    );
    expect(html).toContain('name="twitter:card" content="summary_large_image"');

    const jsonLd = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    );
    expect(jsonLd).not.toBeNull();
    expect(JSON.parse(jsonLd[1])).toMatchObject({
      '@type': 'WebApplication',
      name: 'Wobbi',
      inLanguage: 'en',
      url: 'https://wobbi.vercel.app/',
    });
  });

  it('publishes crawler files with the production URL', async () => {
    const [robots, sitemap] = await Promise.all([
      readProjectFile('public/robots.txt'),
      readProjectFile('public/sitemap.xml'),
    ]);

    expect(robots).toContain('Sitemap: https://wobbi.vercel.app/sitemap.xml');
    expect(sitemap).toContain('<loc>https://wobbi.vercel.app/</loc>');
  });

  it('ships the social preview at the recommended dimensions', async () => {
    const image = await readProjectFile('public/og-wobbi.png', null);

    expect(image.subarray(1, 4).toString()).toBe('PNG');
    expect(image.readUInt32BE(16)).toBe(1200);
    expect(image.readUInt32BE(20)).toBe(630);
  });
});
