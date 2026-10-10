import { webDevelopment, javaFullStack, mobileAppDevelopment } from './engineering';
import { dataScience, uiUxDesign, graphicDesign } from './design-data';
import { digitalMarketing, contentWritingSeo, gameDevelopment } from './marketing-game';
import { additionalRoadmaps } from './additional-data';
import type { FieldRoadmap } from './types';

export * from './types';

/** The sixteen launch fields. Admins can add more through the admin panel. */
export const ROADMAPS: FieldRoadmap[] = [
  webDevelopment,
  javaFullStack,
  mobileAppDevelopment,
  dataScience,
  uiUxDesign,
  graphicDesign,
  digitalMarketing,
  contentWritingSeo,
  gameDevelopment,
  ...additionalRoadmaps,
];

export const roadmapBySlug = (slug: string) => ROADMAPS.find((r) => r.slug === slug);


