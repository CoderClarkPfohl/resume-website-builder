export type SectionName =
  | 'header'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'awards'
  | 'technicalSkills'
  | 'toolsTechnologies'
  | 'publications'
  | 'githubPortfolio'
  | 'relevantExperience'
  | 'internshipExperience'
  | 'leadershipExperience'
  | 'volunteerExperience'
  | 'freelanceContract'
  | 'activities'
  | 'interests'
  | 'languages'
  | 'professionalAffiliations'
  | 'openSourceContributions'
  | 'conferences'
  | 'patents'
  | 'teachingMentorship'
  | 'militaryExperience'
  | 'securityClearance'
  | 'technicalCompetencies'
  | 'professionalProfile'
  | 'careerHighlights'
  | 'keyAchievements'
  | 'coreCompetencies'
  | 'relevantCoursework'
  | 'capstoneThesis'
  | 'trainingWorkshops'
  | 'professionalDevelopment'
  | 'certificationsInProgress'
  | 'testimonials'
  | 'references'
  | 'personalBranding'
  | 'portfolioHighlights'
  | 'caseStudies'
  | 'problemSolving'
  | 'impactSection'
  | 'grantsFunding'
  | 'exhibitions'
  | 'performances'
  | 'other';

export type SectionMap = Record<SectionName, string[]>;

const SECTION_PATTERNS: Array<{ name: SectionName; pattern: RegExp }> = [
  // Summary / Objective / Profile
  { name: 'summary', pattern: /^(professional\s+)?(summary|objective|about(\s+me)?|profile|career\s+objective|career\s+summary)$/i },
  { name: 'professionalProfile', pattern: /^professional\s+profile$/i },
  { name: 'personalBranding', pattern: /^personal\s+brand(ing)?\s+(statement|summary)?$/i },

  // Experience variants
  { name: 'experience', pattern: /^(work\s+)?(experience|employment|history|background|work\s+history|professional\s+experience)$/i },
  { name: 'relevantExperience', pattern: /^relevant\s+(experience|work)$/i },
  { name: 'internshipExperience', pattern: /^internship(s|\s+experience)?$/i },
  { name: 'leadershipExperience', pattern: /^leadership(\s+experience|\s+roles?)?$/i },
  { name: 'volunteerExperience', pattern: /^volunteer(ing|\s+experience|\s+work)?$/i },
  { name: 'freelanceContract', pattern: /^(freelance|contract|consulting)(\s+work|\s+experience)?$/i },
  { name: 'militaryExperience', pattern: /^military(\s+experience|\s+service|\s+history)?$/i },
  { name: 'teachingMentorship', pattern: /^(teaching|mentorship|mentoring|tutoring)(\s+experience)?$/i },

  // Education
  { name: 'education', pattern: /^education(al\s+background)?$/i },
  { name: 'relevantCoursework', pattern: /^(relevant\s+)?coursework$/i },
  { name: 'capstoneThesis', pattern: /^(capstone|thesis|senior\s+project|dissertation)(\/thesis)?$/i },

  // Skills variants
  { name: 'skills', pattern: /^(key\s+)?skills?(\s+(and|&)\s*(qualifications?|expertise|experience|summary|competencies))?$/i },
  { name: 'skills', pattern: /^(qualifications?\s+and\s+)?skills?\s+and\s+qualifications?$/i },
  { name: 'technicalSkills', pattern: /^technical\s+skills?(\s+summary)?$/i },
  { name: 'toolsTechnologies', pattern: /^(tools|technologies)(\s+[&and]+\s+(technologies|tools))?$/i },
  { name: 'coreCompetencies', pattern: /^(core\s+)?(competencies|qualifications?)(\s+(and|&)\s+skills?)?$/i },
  { name: 'technicalCompetencies', pattern: /^technical\s+(competencies|proficiencies)(\s+matrix)?$/i },

  // Projects
  { name: 'projects', pattern: /^(personal\s+|selected\s+|notable\s+|key\s+)?projects?$/i },
  { name: 'openSourceContributions', pattern: /^open\s+source(\s+contributions?|\s+projects?)?$/i },
  { name: 'caseStudies', pattern: /^case\s+stud(y|ies)$/i },

  // Certifications & Training
  { name: 'certifications', pattern: /^certifications?(\s+[&and]+\s+licens(e|es|ing|ure))?$/i },
  { name: 'certificationsInProgress', pattern: /^certifications?\s+in\s+progress$/i },
  { name: 'trainingWorkshops', pattern: /^(training|workshops?)(\s+[&and]+\s+(workshops?|training|seminars?))?$/i },
  { name: 'professionalDevelopment', pattern: /^professional\s+development$/i },

  // Awards & Honors
  { name: 'awards', pattern: /^(awards?|honors?|achievements?|distinctions?)(\s+[&and]+\s+(honors?|awards?|achievements?))?$/i },
  { name: 'keyAchievements', pattern: /^key\s+(achievements?|accomplishments?)$/i },
  { name: 'careerHighlights', pattern: /^career\s+highlights?$/i },

  // Publications & Research
  { name: 'publications', pattern: /^(publications?|research|publications?\s+[&and]+\s+(research|writing))$/i },
  { name: 'patents', pattern: /^(patents?|innovations?|inventions?)(\s+[&and]+\s+(innovations?|patents?))?$/i },
  { name: 'conferences', pattern: /^(conferences?|presentations?|speaking)(\s+[&and]+\s+(presentations?|speaking|conferences?))?$/i },

  // Portfolio & GitHub
  { name: 'githubPortfolio', pattern: /^(github|portfolio|code\s+samples?)(\s+[&and\/]+\s+(portfolio|github))?$/i },
  { name: 'portfolioHighlights', pattern: /^portfolio\s+highlights?$/i },

  // Activities & Interests
  { name: 'activities', pattern: /^(activities|extracurriculars?)(\s+[&and]+\s+(extracurriculars?|activities))?$/i },
  { name: 'interests', pattern: /^(interests?|hobbies)(\s+[&and]+\s+(hobbies|interests?))?$/i },

  // Languages
  { name: 'languages', pattern: /^(spoken\s+)?languages?(\s+spoken)?$/i },

  // Affiliations
  { name: 'professionalAffiliations', pattern: /^(professional\s+)?(affiliations?|memberships?|associations?)$/i },

  // Security
  { name: 'securityClearance', pattern: /^security\s+clearance(\s+level)?$/i },

  // Testimonials & References
  { name: 'testimonials', pattern: /^(testimonials?|references?\s+quotes?|recommendations?)$/i },
  { name: 'references', pattern: /^references?$/i },

  // Impact & Problem-Solving
  { name: 'impactSection', pattern: /^impact(\s+section|\s+statement)?$/i },
  { name: 'problemSolving', pattern: /^problem[\s-]solving(\s+experience)?$/i },

  // Grants & Creative
  { name: 'grantsFunding', pattern: /^(grants?|funding)(\s+[&and]+\s+(funding|grants?))?$/i },
  { name: 'exhibitions', pattern: /^exhibitions?$/i },
  { name: 'performances', pattern: /^performances?$/i },
];

// Human-readable display titles for each section
export const SECTION_DISPLAY_TITLES: Record<SectionName, string> = {
  header: 'Header',
  summary: 'Summary / Objective',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  awards: 'Awards / Honors',
  technicalSkills: 'Technical Skills',
  toolsTechnologies: 'Tools & Technologies',
  publications: 'Publications / Research',
  githubPortfolio: 'GitHub / Portfolio',
  relevantExperience: 'Relevant Experience',
  internshipExperience: 'Internship Experience',
  leadershipExperience: 'Leadership Experience',
  volunteerExperience: 'Volunteer Experience',
  freelanceContract: 'Freelance / Contract Work',
  activities: 'Activities / Extracurriculars',
  interests: 'Interests',
  languages: 'Languages (Spoken)',
  professionalAffiliations: 'Professional Affiliations',
  openSourceContributions: 'Open Source Contributions',
  conferences: 'Conferences / Presentations',
  patents: 'Patents / Innovations',
  teachingMentorship: 'Teaching / Mentorship',
  militaryExperience: 'Military Experience',
  securityClearance: 'Security Clearance',
  technicalCompetencies: 'Technical Competencies Matrix',
  professionalProfile: 'Professional Profile',
  careerHighlights: 'Career Highlights',
  keyAchievements: 'Key Achievements',
  coreCompetencies: 'Core Competencies',
  relevantCoursework: 'Relevant Coursework',
  capstoneThesis: 'Capstone / Thesis',
  trainingWorkshops: 'Training & Workshops',
  professionalDevelopment: 'Professional Development',
  certificationsInProgress: 'Certifications in Progress',
  testimonials: 'Testimonials / References Quote',
  references: 'References',
  personalBranding: 'Personal Branding Statement',
  portfolioHighlights: 'Portfolio Highlights',
  caseStudies: 'Case Studies',
  problemSolving: 'Problem-Solving Experience',
  impactSection: 'Impact Section',
  grantsFunding: 'Grants / Funding',
  exhibitions: 'Exhibitions',
  performances: 'Performances',
  other: 'Other',
};

// Which section types should be parsed as experience-like (title/company/dates/bullets)
export const EXPERIENCE_LIKE_SECTIONS: SectionName[] = [
  'experience', 'relevantExperience', 'internshipExperience',
  'leadershipExperience', 'volunteerExperience', 'freelanceContract',
  'militaryExperience', 'teachingMentorship',
];

// Which section types should be parsed as education-like
export const EDUCATION_LIKE_SECTIONS: SectionName[] = [
  'education',
];

// Which section types are skill/list-like (comma-separated or bullet lists)
export const LIST_LIKE_SECTIONS: SectionName[] = [
  'skills', 'technicalSkills', 'toolsTechnologies', 'coreCompetencies',
  'technicalCompetencies', 'interests', 'languages', 'relevantCoursework',
];

// Which sections are text blocks (paragraphs)
export const TEXT_LIKE_SECTIONS: SectionName[] = [
  'summary', 'professionalProfile', 'personalBranding',
  'securityClearance', 'impactSection',
];

// All valid section names (excluding header)
export const ALL_SECTION_NAMES: SectionName[] = Object.keys(SECTION_DISPLAY_TITLES)
  .filter((k) => k !== 'header') as SectionName[];

function detectSectionHeader(line: string): SectionName | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const cleaned = trimmed.replace(/:$/, '').trim();

  // Match against known section names
  for (const { name, pattern } of SECTION_PATTERNS) {
    if (pattern.test(cleaned)) {
      return name;
    }
  }

  // Also treat all-caps short lines as section headers
  const isAllCaps = trimmed === trimmed.toUpperCase();
  const isShort = trimmed.length <= 50;
  const hasNoSentenceEnd = !/[.!?]/.test(trimmed);
  if (isAllCaps && isShort && hasNoSentenceEnd && /^[A-Z\s&/(),-]+$/.test(trimmed)) {
    const lower = trimmed.toLowerCase();
    for (const { name, pattern } of SECTION_PATTERNS) {
      if (pattern.test(lower)) {
        return name;
      }
    }
    return 'other';
  }

  return null;
}

export function detectSections(rawText: string): SectionMap {
  const lines = rawText.split('\n');
  const sectionMap = {} as SectionMap;

  // Initialize all sections as empty arrays
  for (const key of ALL_SECTION_NAMES) {
    sectionMap[key] = [];
  }
  sectionMap.header = [];

  let currentSection: SectionName = 'header';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const detected = detectSectionHeader(trimmed);
    if (detected !== null) {
      currentSection = detected;
      continue;
    }

    sectionMap[currentSection].push(trimmed);
  }

  return sectionMap;
}
