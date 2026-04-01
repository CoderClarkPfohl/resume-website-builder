import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeService } from '../../services/resume.service';
import { ParsedResume, TemplateConfig } from '../../models/resume.model';
import { SectionPickerComponent } from '../section-picker/section-picker.component';
import { ResumeEditorComponent } from '../resume-editor/resume-editor.component';
import { TemplatePickerComponent } from '../template-picker/template-picker.component';
import { ResultComponent } from '../result/result.component';

type AppState = 'idle' | 'parsing' | 'section-select' | 'resume-edit' | 'template-select' | 'generating' | 'done' | 'error';

const STEPS = [
  { key: 'upload', label: 'Upload' },
  { key: 'sections', label: 'Sections' },
  { key: 'edit', label: 'Edit' },
  { key: 'template', label: 'Template' },
  { key: 'done', label: 'Done' },
] as const;

const STATE_TO_STEP: Record<AppState, number> = {
  'idle': 0,
  'parsing': 0,
  'section-select': 1,
  'resume-edit': 2,
  'template-select': 3,
  'generating': 3,
  'done': 4,
  'error': 0,
};

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, SectionPickerComponent, ResumeEditorComponent, TemplatePickerComponent, ResultComponent],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent {
  private resumeService = inject(ResumeService);

  state: AppState = 'idle';
  errorMessage = '';
  dragOver = false;

  parsedResume: ParsedResume | null = null;
  enabledSections: string[] = [];
  siteId = '';
  siteUrl = '';

  get isGenerating() { return this.state === 'generating'; }

  readonly steps = STEPS;
  get currentStep(): number { return STATE_TO_STEP[this.state]; }
  get showSteps(): boolean { return this.state !== 'idle' && this.state !== 'error'; }

  onFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.handleFile(input.files[0]);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave() { this.dragOver = false; }

  private handleFile(file: File) {
    const allowed = ['application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      this.setError('Please upload a PDF or DOCX file.');
      return;
    }

    this.state = 'parsing';
    this.resumeService.uploadResume(file).subscribe({
      next: ({ parsed }) => {
        this.parsedResume = parsed;
        this.state = 'section-select';
      },
      error: (err) => {
        const msg = err?.error?.error ?? 'Failed to parse resume. Please try another file.';
        this.setError(msg);
      },
    });
  }

  onSectionsConfirmed(sections: string[]) {
    this.enabledSections = sections;
    this.state = 'resume-edit';
  }

  onResumeEdited(updated: ParsedResume) {
    this.parsedResume = updated;
    this.state = 'template-select';
  }

  onEditorBack() {
    this.state = 'section-select';
  }

  onChangeTemplate() {
    this.state = 'template-select';
  }

  onTemplateBack() {
    this.state = 'resume-edit';
  }

  onTemplateSelected({ id, config }: { id: string; config: TemplateConfig }) {
    if (!this.parsedResume) return;
    this.state = 'generating';
    this.resumeService.generateSite(this.parsedResume, id, this.enabledSections, config).subscribe({
      next: ({ siteId, siteUrl }) => {
        this.siteId = siteId;
        this.siteUrl = siteUrl;
        this.state = 'done';
      },
      error: (err) => {
        const msg = err?.error?.error ?? 'Failed to generate site.';
        this.setError(msg);
      },
    });
  }

  reset() {
    this.state = 'idle';
    this.parsedResume = null;
    this.enabledSections = [];
    this.siteId = '';
    this.siteUrl = '';
    this.errorMessage = '';
  }

  private setError(msg: string) {
    this.errorMessage = msg;
    this.state = 'error';
  }
}
