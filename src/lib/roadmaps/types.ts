import type { Duration } from '../brand';

export type RoadmapTask = {
  title: string;
  description: string;
  objective: string;
  deliverable: string;
  points?: number;
  submissionType?: 'file' | 'url' | 'text' | 'file_or_url';
  allowedFileTypes?: string[];
  deadlineOffsetDays?: number;
};

export type RoadmapWeek = {
  title: string;
  summary: string;
  objectives: string[];
  tasks: RoadmapTask[];
  isFinal?: boolean;
};

export type FieldRoadmap = {
  slug: string;
  name: string;
  icon: string;
  shortDescription: string;
  description: string;
  skills: string[];
  evaluationCriteria: string;
  certificateCriteria: string;
  /** The launch program uses the first four roadmap weeks for the 1-month internship. */
  weeks: RoadmapWeek[];
};

/**
 * The public Zinternora programme is a 1-month / 4-week internship.
 * Each domain's first four roadmap weeks are used in order:
 * Week 1 -> Week 2 -> Week 3 -> Week 4 (final project week).
 */
export function roadmapFor(field: FieldRoadmap, duration: Duration): RoadmapWeek[] {
  const weeks = field.weeks.slice(0, duration);
  if (!weeks.length) return [];
  return weeks.map((week, index) => ({
    ...week,
    isFinal: index === weeks.length - 1,
  }));
}

export const t = (
  title: string, description: string, objective: string, deliverable: string,
  points = 10, extra: Partial<RoadmapTask> = {},
): RoadmapTask => ({ title, description, objective, deliverable, points, ...extra });


