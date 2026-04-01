import { SectionDefinition, SectionGroup } from '../section.base';

export class TechnicalSkillsSection extends SectionDefinition {
  readonly key = 'technicalSkills';
  readonly label = 'Technical Skills (Detailed)';
  readonly category = 'Skills & Technical';
}

export class ToolsTechnologiesSection extends SectionDefinition {
  readonly key = 'toolsTechnologies';
  readonly label = 'Tools & Technologies';
  readonly category = 'Skills & Technical';
}

export class CoreCompetenciesSection extends SectionDefinition {
  readonly key = 'coreCompetencies';
  readonly label = 'Core Competencies';
  readonly category = 'Skills & Technical';
}

export class TechnicalCompetenciesSection extends SectionDefinition {
  readonly key = 'technicalCompetencies';
  readonly label = 'Technical Competencies Matrix';
  readonly category = 'Skills & Technical';
}

export const SKILLS_TECHNICAL_GROUP: SectionGroup = {
  category: 'Skills & Technical',
  items: [
    new TechnicalSkillsSection(),
    new ToolsTechnologiesSection(),
    new CoreCompetenciesSection(),
    new TechnicalCompetenciesSection(),
  ],
};
