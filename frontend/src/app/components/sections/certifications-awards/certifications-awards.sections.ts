import { SectionDefinition, SectionGroup } from '../section.base';

export class CertificationsSection extends SectionDefinition {
  readonly key = 'certifications';
  readonly label = 'Certifications';
  readonly category = 'Certifications & Awards';
}

export class CertificationsInProgressSection extends SectionDefinition {
  readonly key = 'certificationsInProgress';
  readonly label = 'Certifications in Progress';
  readonly category = 'Certifications & Awards';
}

export class AwardsSection extends SectionDefinition {
  readonly key = 'awards';
  readonly label = 'Awards / Honors';
  readonly category = 'Certifications & Awards';
}

export class KeyAchievementsSection extends SectionDefinition {
  readonly key = 'keyAchievements';
  readonly label = 'Key Achievements';
  readonly category = 'Certifications & Awards';
}

export class CareerHighlightsSection extends SectionDefinition {
  readonly key = 'careerHighlights';
  readonly label = 'Career Highlights';
  readonly category = 'Certifications & Awards';
}

export const CERTIFICATIONS_AWARDS_GROUP: SectionGroup = {
  category: 'Certifications & Awards',
  items: [
    new CertificationsSection(),
    new CertificationsInProgressSection(),
    new AwardsSection(),
    new KeyAchievementsSection(),
    new CareerHighlightsSection(),
  ],
};
