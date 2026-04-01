import { SectionDefinition, SectionGroup } from '../section.base';

export class RelevantExperienceSection extends SectionDefinition {
  readonly key = 'relevantExperience';
  readonly label = 'Relevant Experience';
  readonly category = 'Experience Variants';
}

export class InternshipExperienceSection extends SectionDefinition {
  readonly key = 'internshipExperience';
  readonly label = 'Internship Experience';
  readonly category = 'Experience Variants';
}

export class LeadershipExperienceSection extends SectionDefinition {
  readonly key = 'leadershipExperience';
  readonly label = 'Leadership Experience';
  readonly category = 'Experience Variants';
}

export class VolunteerExperienceSection extends SectionDefinition {
  readonly key = 'volunteerExperience';
  readonly label = 'Volunteer Experience';
  readonly category = 'Experience Variants';
}

export class FreelanceContractSection extends SectionDefinition {
  readonly key = 'freelanceContract';
  readonly label = 'Freelance / Contract Work';
  readonly category = 'Experience Variants';
}

export class MilitaryExperienceSection extends SectionDefinition {
  readonly key = 'militaryExperience';
  readonly label = 'Military Experience';
  readonly category = 'Experience Variants';
}

export class TeachingMentorshipSection extends SectionDefinition {
  readonly key = 'teachingMentorship';
  readonly label = 'Teaching / Mentorship';
  readonly category = 'Experience Variants';
}

export const EXPERIENCE_VARIANTS_GROUP: SectionGroup = {
  category: 'Experience Variants',
  items: [
    new RelevantExperienceSection(),
    new InternshipExperienceSection(),
    new LeadershipExperienceSection(),
    new VolunteerExperienceSection(),
    new FreelanceContractSection(),
    new MilitaryExperienceSection(),
    new TeachingMentorshipSection(),
  ],
};
