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

export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  location?: string;
  linkedin?: string;
  website?: string;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
}

export interface UploadResponse {
  parsed: ParsedResume;
}

export interface GenerateResponse {
  siteId: string;
  siteUrl: string;
}

export interface DeployResponse {
  repoUrl: string;
  netlifyUrl: string;
  warning?: string;
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
}
