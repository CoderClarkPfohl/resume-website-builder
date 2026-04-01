import { SectionDefinition, SectionGroup } from '../section.base';

export class ActivitiesSection extends SectionDefinition {
  readonly key = 'activities';
  readonly label = 'Activities / Extracurriculars';
  readonly category = 'Other';
}

export class InterestsSection extends SectionDefinition {
  readonly key = 'interests';
  readonly label = 'Interests';
  readonly category = 'Other';
}

export class LanguagesSection extends SectionDefinition {
  readonly key = 'languages';
  readonly label = 'Languages (Spoken)';
  readonly category = 'Other';
}

export class ProfessionalAffiliationsSection extends SectionDefinition {
  readonly key = 'professionalAffiliations';
  readonly label = 'Professional Affiliations';
  readonly category = 'Other';
}

export class SecurityClearanceSection extends SectionDefinition {
  readonly key = 'securityClearance';
  readonly label = 'Security Clearance';
  readonly category = 'Other';
}

export class TestimonialsSection extends SectionDefinition {
  readonly key = 'testimonials';
  readonly label = 'Testimonials / References Quote';
  readonly category = 'Other';
}

export class ReferencesSection extends SectionDefinition {
  readonly key = 'references';
  readonly label = 'References';
  readonly category = 'Other';
}

export class ExhibitionsSection extends SectionDefinition {
  readonly key = 'exhibitions';
  readonly label = 'Exhibitions';
  readonly category = 'Other';
}

export class PerformancesSection extends SectionDefinition {
  readonly key = 'performances';
  readonly label = 'Performances';
  readonly category = 'Other';
}

export const OTHER_GROUP: SectionGroup = {
  category: 'Other',
  items: [
    new ActivitiesSection(),
    new InterestsSection(),
    new LanguagesSection(),
    new ProfessionalAffiliationsSection(),
    new SecurityClearanceSection(),
    new TestimonialsSection(),
    new ReferencesSection(),
    new ExhibitionsSection(),
    new PerformancesSection(),
  ],
};
