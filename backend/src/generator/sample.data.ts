import { ParsedResume } from '../models/resume.model';

/** Sample resume used for template preview rendering. */
export const SAMPLE_RESUME: ParsedResume = {
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  phone: '555-867-5309',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/alexmorgan',
  website: 'alexmorgan.dev',
  summary:
    'Full-stack software engineer with 5+ years of experience building scalable web applications and cloud infrastructure. Passionate about clean code, developer experience, and mentoring junior engineers.',
  experience: [
    {
      company: 'Acme Corp',
      title: 'Senior Software Engineer',
      startDate: 'Jan 2021',
      endDate: 'Present',
      location: 'San Francisco, CA',
      bullets: [
        'Led migration of monolith to microservices, reducing deploy time by 60%',
        'Mentored a team of 4 junior engineers through weekly 1:1s and code reviews',
        'Built internal developer tooling adopted by 200+ engineers across the org',
      ],
    },
    {
      company: 'Startup Inc',
      title: 'Software Engineer',
      startDate: 'Jun 2018',
      endDate: 'Dec 2020',
      location: 'Remote',
      bullets: [
        'Built REST APIs serving 1M+ requests per day with 99.9% uptime',
        'Implemented CI/CD pipeline reducing release cycles from weekly to daily',
        'Redesigned onboarding flow, improving activation rate by 34%',
      ],
    },
  ],
  education: [
    {
      institution: 'University of California, Berkeley',
      degree: 'B.S. Computer Science',
      startDate: '2014',
      endDate: '2018',
      gpa: '3.8',
    },
  ],
  skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Python', 'GraphQL'],
  sections: {
    summary: {
      key: 'summary',
      title: 'Summary / Objective',
      type: 'text',
      textContent:
        'Full-stack software engineer with 5+ years of experience building scalable web applications and cloud infrastructure. Passionate about clean code, developer experience, and mentoring junior engineers.',
    },
    experience: {
      key: 'experience',
      title: 'Work Experience',
      type: 'experience',
      entries: [
        {
          heading: 'Senior Software Engineer',
          subheading: 'Acme Corp · San Francisco, CA',
          date: 'Jan 2021 – Present',
          bullets: [
            'Led migration of monolith to microservices, reducing deploy time by 60%',
            'Mentored a team of 4 junior engineers through weekly 1:1s and code reviews',
            'Built internal developer tooling adopted by 200+ engineers across the org',
          ],
        },
        {
          heading: 'Software Engineer',
          subheading: 'Startup Inc · Remote',
          date: 'Jun 2018 – Dec 2020',
          bullets: [
            'Built REST APIs serving 1M+ requests per day with 99.9% uptime',
            'Implemented CI/CD pipeline reducing release cycles from weekly to daily',
            'Redesigned onboarding flow, improving activation rate by 34%',
          ],
        },
      ],
    },
    education: {
      key: 'education',
      title: 'Education',
      type: 'education',
      entries: [
        {
          heading: 'University of California, Berkeley',
          subheading: 'B.S. Computer Science',
          date: '2014 – 2018',
          bullets: ['GPA: 3.8'],
        },
      ],
    },
    skills: {
      key: 'skills',
      title: 'Skills',
      type: 'list',
      listItems: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Python', 'GraphQL'],
    },
    projects: {
      key: 'projects',
      title: 'Projects',
      type: 'entries',
      entries: [
        {
          heading: 'Open Resume',
          subheading: 'github.com/alexmorgan/open-resume',
          date: '2023',
          bullets: [
            'Open-source resume builder with 2k+ GitHub stars',
            'Built with React, TypeScript, and Tailwind CSS',
          ],
        },
        {
          heading: 'Cloud Cost Analyzer',
          date: '2022',
          bullets: [
            'CLI tool for visualizing AWS spend across accounts',
            'Used by 500+ engineers at 3 companies',
          ],
        },
      ],
    },
    certifications: {
      key: 'certifications',
      title: 'Certifications',
      type: 'entries',
      entries: [
        { heading: 'AWS Solutions Architect – Professional', date: '2022', bullets: [] },
        { heading: 'Certified Kubernetes Administrator (CKA)', date: '2021', bullets: [] },
      ],
    },
  },
};

export const SAMPLE_SECTIONS = Object.keys(SAMPLE_RESUME.sections);
