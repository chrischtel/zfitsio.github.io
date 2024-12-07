import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'zfitsio',
      description: 'FITS file I/O library for Zig',
      logo: {
        src: './src/assets/logo.svg',
      },
      social: {
        github: 'https://github.com/yourusername/zfitsio',
      },
      
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', link: '/getting-started/introduction' },
            { label: 'Installation', link: '/getting-started/installation' },
            { label: 'Quick Start', link: '/getting-started/quick-start' },
          ],
        },
        {
          label: 'API Reference',
          autogenerate: { directory: 'reference' },
        },
        {
          label: 'DevLogs',
          autogenerate: { directory: 'devlogs' },
        },
        {
          label: 'Examples',
          items: [
            { label: 'Reading FITS Files', link: '/examples/reading-fits' },
            { label: 'Writing FITS Files', link: '/examples/writing-fits' },
            { label: 'Working with Headers', link: '/examples/headers' },
          ],
        },
      ],
    }),
  ],
  
  site: 'https://zfitsio.github.io',
  base: '/',
});