import { SectionDefinition, SectionGroup } from '../section.base';

export class ProfessionalProfileSection extends SectionDefinition {
  readonly key = 'professionalProfile';
  readonly label = 'Professional Profile';
  readonly category = 'Profile & Branding';
}

export class PersonalBrandingSection extends SectionDefinition {
  readonly key = 'personalBranding';
  readonly label = 'Personal Branding Statement';
  readonly category = 'Profile & Branding';
}

export class ImpactSectionSection extends SectionDefinition {
  readonly key = 'impactSection';
  readonly label = 'Impact Section';
  readonly category = 'Profile & Branding';
}

export class ProblemSolvingSection extends SectionDefinition {
  readonly key = 'problemSolving';
  readonly label = 'Problem-Solving Experience';
  readonly category = 'Profile & Branding';
}

export const PROFILE_BRANDING_GROUP: SectionGroup = {
  category: 'Profile & Branding',
  items: [
    new ProfessionalProfileSection(),
    new PersonalBrandingSection(),
    new ImpactSectionSection(),
    new ProblemSolvingSection(),
  ],
};
