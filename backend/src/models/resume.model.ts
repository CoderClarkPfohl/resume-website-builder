export interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  location?: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
}

export interface GenericEntry {
  heading: string;
  subheading?: string;
  date?: string;
  bullets: string[];
}

export interface GenericSection {
  key: string;
  title: string;
  type: 'experience' | 'education' | 'list' | 'text' | 'entries';
  textContent?: string;
  listItems?: string[];
  entries?: GenericEntry[];
}

export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  location?: string;
  linkedin?: string;
  website?: string;
  github?: string;
  portfolio?: string;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  sections: Record<string, GenericSection>;
}

export interface UploadResponse {
  parsed: ParsedResume;
}

export interface GenerateRequest {
  parsed: ParsedResume;
  templateId: string;
  enabledSections: string[];
}

export interface GenerateResponse {
  siteId: string;
  siteUrl: string;
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
}

export interface DeployRequest {
  siteId: string;
  repoName: string;
}

export interface DeployResponse {
  repoUrl: string;
  netlifyUrl: string;
}
