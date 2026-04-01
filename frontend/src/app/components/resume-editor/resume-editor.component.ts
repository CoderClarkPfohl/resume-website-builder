import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParsedResume, GenericSection, GenericEntry } from '../../models/resume.model';

@Component({
  selector: 'app-resume-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resume-editor.component.html',
  styleUrls: ['./resume-editor.component.scss'],
})
export class ResumeEditorComponent implements OnInit {
  @Input() parsedResume!: ParsedResume;
  @Input() enabledSections: string[] = [];
  @Output() resumeEdited = new EventEmitter<ParsedResume>();
  @Output() back = new EventEmitter<void>();

  draft!: ParsedResume;

  ngOnInit() {
    // Deep clone so edits don't mutate the original until confirmed
    this.draft = JSON.parse(JSON.stringify(this.parsedResume));

    // Ensure optional fields are initialized for two-way binding
    for (const key of this.enabledSections) {
      const section = this.draft.sections?.[key];
      if (!section) continue;
      if (section.type === 'text' && section.textContent == null) section.textContent = '';
      if (section.type === 'list' && !section.listItems) section.listItems = [];
      if (['experience', 'education', 'entries'].includes(section.type) && !section.entries) section.entries = [];
    }
  }

  // --- List helpers ---
  getListText(section: GenericSection): string {
    return (section.listItems ?? []).join('\n');
  }

  setListFromText(section: GenericSection, text: string): void {
    section.listItems = text.split('\n').map((s) => s.trim()).filter(Boolean);
  }

  // --- Entry helpers ---
  getBulletsText(entry: GenericEntry): string {
    return (entry.bullets ?? []).join('\n');
  }

  setBulletsFromText(entry: GenericEntry, text: string): void {
    entry.bullets = text.split('\n').map((s) => s.trim()).filter(Boolean);
  }

  addEntry(sectionKey: string): void {
    const section = this.draft.sections[sectionKey];
    if (!section) return;
    if (!section.entries) section.entries = [];
    section.entries.push({ heading: '', subheading: '', date: '', bullets: [] });
  }

  removeEntry(sectionKey: string, index: number): void {
    this.draft.sections[sectionKey]?.entries?.splice(index, 1);
  }

  // --- Section key iteration (only enabled + present) ---
  get activeSectionKeys(): string[] {
    return this.enabledSections.filter((k) => k in (this.draft.sections ?? {}));
  }

  isEntryType(section: GenericSection): boolean {
    return ['experience', 'education', 'entries'].includes(section.type);
  }

  confirm(): void {
    this.resumeEdited.emit(this.draft);
  }
}
