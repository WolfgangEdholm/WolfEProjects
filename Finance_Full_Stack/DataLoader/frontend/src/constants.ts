import { NavItem } from 'src/types';

// port connecting to backend server
export const port = '8080';

export const navbarWidth = '300px';

export const codeDebug = false;
export const logIo = false;
export const logModalResults = false;
export const logUiUpdates = false;

export const minTransDisplayDelay = 1000;

export const constNavbarEntries: NavItem[] = [
  {
    name: 'Home',
    routerLinkUrl: '/home',
    icon: 'home',
  },
  {
    name: 'Query',
    routerLinkUrl: '/query',
    icon: 'policy',
  },
  {
    name: 'Transformer',
    routerLinkUrl: '/trans',
    icon: 'build',
  },
  {
    name: '-Users',
    routerLinkUrl: '/users',
    icon: 'people',
  },
  {
    name: '-Settings',
    routerLinkUrl: '/settings',
    icon: 'settings',
  },
  {
    name: 'Query Integrity Report',
    routerLinkUrl: '/reports/queryIntegrity',
    icon: 'find_in_page',
  },
  {
    name: 'Old Query Integrity Report2',
    routerLinkUrl: '/reports/read2',
    icon: 'find_in_page',
  },
  {
    name: 'Query Field Report',
    routerLinkUrl: '/reports/write',
    icon: 'find_in_page',
  },
  {
    name: 'Test Report',
    routerLinkUrl: '/reports/test',
    icon: 'quiz',
  },
  {
    name: '-User Report',
    routerLinkUrl: '/reports/user',
    icon: 'find_in_page',
  },
  {
    name: 'Tests',
    routerLinkUrl: '/tests',
    icon: 'quiz',
  },
  // {
  //   name: 'Segments',
  //   routerLinkUrl: '/segments',
  //   icon: 'view_week',
  // },
];


