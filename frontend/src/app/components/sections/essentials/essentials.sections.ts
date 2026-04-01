import { SectionDefinition, SectionGroup } from '../section.base';

export class SummarySection extends SectionDefinition {
  readonly key = 'summary';
  readonly label = 'Summary / Objective';
  readonly category = 'Essentials';
}

export class WorkExperienceSection extends SectionDefinition {
  readonly key = 'experience';
  readonly label = 'Work Experience';
  readonly category = 'Essentials';
}

export class EducationSection extends SectionDefinition {
  readonly key = 'education';
  readonly label = 'Education';
  readonly category = 'Essentials';
}

export class SkillsSection extends SectionDefinition {
  readonly key = 'skills';
  readonly label = 'Skills';
  readonly category = 'Essentials';
}

export const ESSENTIALS_GROUP: SectionGroup = {
  category: 'Essentials',
  items: [
    new SummarySection(),
    new WorkExperienceSection(),
    new EducationSection(),
    new SkillsSection(),
  ],
};
