import { SectionDefinition, SectionGroup } from '../section.base';

export class RelevantCourseworkSection extends SectionDefinition {
  readonly key = 'relevantCoursework';
  readonly label = 'Relevant Coursework';
  readonly category = 'Education & Training';
}

export class CapstoneThesisSection extends SectionDefinition {
  readonly key = 'capstoneThesis';
  readonly label = 'Capstone / Thesis';
  readonly category = 'Education & Training';
}

export class TrainingWorkshopsSection extends SectionDefinition {
  readonly key = 'trainingWorkshops';
  readonly label = 'Training & Workshops';
  readonly category = 'Education & Training';
}

export class ProfessionalDevelopmentSection extends SectionDefinition {
  readonly key = 'professionalDevelopment';
  readonly label = 'Professional Development';
  readonly category = 'Education & Training';
}

export const EDUCATION_TRAINING_GROUP: SectionGroup = {
  category: 'Education & Training',
  items: [
    new RelevantCourseworkSection(),
    new CapstoneThesisSection(),
    new TrainingWorkshopsSection(),
    new ProfessionalDevelopmentSection(),
  ],
};
