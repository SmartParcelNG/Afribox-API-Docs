import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';
import readSidebar from './docs/api/read/sidebar';
import writeSidebar from './docs/api/write/sidebar';

const guidesSidebar = [
  'intro',
  'authentication',
  'response-and-errors',
  'limits-and-versions',
  {
    type: 'category' as const,
    label: 'Guides',
    items: ['guides/paystack-b2b', 'guides/paystack-b2c', 'guides/kiosk', 'guides/webhook'],
  },
];

const sidebars: SidebarsConfig = {
  guidesSidebar,
  readSidebar,
  writeSidebar,
};

export default sidebars;
