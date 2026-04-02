import { GenericSection } from '../../models/resume.model';

export abstract class SectionDefinition {
  abstract readonly key: string;
  abstract readonly label: string;
  abstract readonly category: string;
}

export interface SectionGroup {
  category: string;
  items: SectionDefinition[];
}

/** Map of section keys to their default GenericSection type. */
const EXPERIENCE_KEYS = new Set([
  'experience', 'relevantExperience', 'internshipExperience', 'leadershipExperience',
  'volunteerExperience', 'freelanceContract', 'militaryExperience', 'teachingMentorship',
]);

const LIST_KEYS = new Set([
  'skills', 'technicalSkills', 'toolsTechnologies', 'coreCompetencies',
  'technicalCompetencies', 'interests', 'languages', 'relevantCoursework', 'activities',
]);

const TEXT_KEYS = new Set([
  'summary', 'professionalProfile', 'personalBranding', 'securityClearance',
  'impactSection', 'problemSolving',
]);

const EDUCATION_KEYS = new Set(['education']);

export function getDefaultSectionType(key: string): GenericSection['type'] {
  if (EXPERIENCE_KEYS.has(key)) return 'experience';
  if (EDUCATION_KEYS.has(key)) return 'education';
  if (LIST_KEYS.has(key)) return 'list';
  if (TEXT_KEYS.has(key)) return 'text';
  return 'entries';
}

/** Create an empty GenericSection stub for a section key. */
export function createEmptySection(key: string, label: string): GenericSection {
  const type = getDefaultSectionType(key);
  const section: GenericSection = { key, title: label, type };

  switch (type) {
    case 'text':
      section.textContent = '';
      break;
    case 'list':
      section.listItems = [];
      break;
    case 'experience':
    case 'education':
    case 'entries':
      section.entries = [];
      break;
  }
  return section;
}
