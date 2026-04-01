import { SectionDefinition, SectionGroup } from '../section.base';

export class ProjectsSection extends SectionDefinition {
  readonly key = 'projects';
  readonly label = 'Projects';
  readonly category = 'Projects & Portfolio';
}

export class GithubPortfolioSection extends SectionDefinition {
  readonly key = 'githubPortfolio';
  readonly label = 'GitHub / Portfolio';
  readonly category = 'Projects & Portfolio';
}

export class OpenSourceSection extends SectionDefinition {
  readonly key = 'openSourceContributions';
  readonly label = 'Open Source Contributions';
  readonly category = 'Projects & Portfolio';
}

export class PortfolioHighlightsSection extends SectionDefinition {
  readonly key = 'portfolioHighlights';
  readonly label = 'Portfolio Highlights';
  readonly category = 'Projects & Portfolio';
}

export class CaseStudiesSection extends SectionDefinition {
  readonly key = 'caseStudies';
  readonly label = 'Case Studies';
  readonly category = 'Projects & Portfolio';
}

export const PROJECTS_PORTFOLIO_GROUP: SectionGroup = {
  category: 'Projects & Portfolio',
  items: [
    new ProjectsSection(),
    new GithubPortfolioSection(),
    new OpenSourceSection(),
    new PortfolioHighlightsSection(),
    new CaseStudiesSection(),
  ],
};
