import { SectionGroup } from './section.base';
import { ESSENTIALS_GROUP } from './essentials/essentials.sections';
import { EXPERIENCE_VARIANTS_GROUP } from './experience-variants/experience-variants.sections';
import { SKILLS_TECHNICAL_GROUP } from './skills-technical/skills-technical.sections';
import { PROJECTS_PORTFOLIO_GROUP } from './projects-portfolio/projects-portfolio.sections';
import { EDUCATION_TRAINING_GROUP } from './education-training/education-training.sections';
import { CERTIFICATIONS_AWARDS_GROUP } from './certifications-awards/certifications-awards.sections';
import { PUBLICATIONS_RESEARCH_GROUP } from './publications-research/publications-research.sections';
import { PROFILE_BRANDING_GROUP } from './profile-branding/profile-branding.sections';
import { OTHER_GROUP } from './other/other.sections';

export const SECTION_CATALOG: SectionGroup[] = [
  ESSENTIALS_GROUP,
  EXPERIENCE_VARIANTS_GROUP,
  SKILLS_TECHNICAL_GROUP,
  PROJECTS_PORTFOLIO_GROUP,
  EDUCATION_TRAINING_GROUP,
  CERTIFICATIONS_AWARDS_GROUP,
  PUBLICATIONS_RESEARCH_GROUP,
  PROFILE_BRANDING_GROUP,
  OTHER_GROUP,
];

export * from './section.base';
export * from './essentials/essentials.sections';
export * from './experience-variants/experience-variants.sections';
export * from './skills-technical/skills-technical.sections';
export * from './projects-portfolio/projects-portfolio.sections';
export * from './education-training/education-training.sections';
export * from './certifications-awards/certifications-awards.sections';
export * from './publications-research/publications-research.sections';
export * from './profile-branding/profile-branding.sections';
export * from './other/other.sections';
