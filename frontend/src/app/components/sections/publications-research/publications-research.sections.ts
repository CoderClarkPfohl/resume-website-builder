import { SectionDefinition, SectionGroup } from '../section.base';

export class PublicationsSection extends SectionDefinition {
  readonly key = 'publications';
  readonly label = 'Publications / Research';
  readonly category = 'Publications & Research';
}

export class ConferencesSection extends SectionDefinition {
  readonly key = 'conferences';
  readonly label = 'Conferences / Presentations';
  readonly category = 'Publications & Research';
}

export class PatentsSection extends SectionDefinition {
  readonly key = 'patents';
  readonly label = 'Patents / Innovations';
  readonly category = 'Publications & Research';
}

export class GrantsFundingSection extends SectionDefinition {
  readonly key = 'grantsFunding';
  readonly label = 'Grants / Funding';
  readonly category = 'Publications & Research';
}

export const PUBLICATIONS_RESEARCH_GROUP: SectionGroup = {
  category: 'Publications & Research',
  items: [
    new PublicationsSection(),
    new ConferencesSection(),
    new PatentsSection(),
    new GrantsFundingSection(),
  ],
};
