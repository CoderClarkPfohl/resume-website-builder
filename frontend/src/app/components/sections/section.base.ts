export abstract class SectionDefinition {
  abstract readonly key: string;
  abstract readonly label: string;
  abstract readonly category: string;
}

export interface SectionGroup {
  category: string;
  items: SectionDefinition[];
}
