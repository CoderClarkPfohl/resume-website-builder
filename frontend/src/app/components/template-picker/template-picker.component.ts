import { Component, Input, Output, EventEmitter, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TemplateMetadata } from '../../models/resume.model';
import { ResumeService } from '../../services/resume.service';

@Component({
  selector: 'app-template-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './template-picker.component.html',
  styleUrls: ['./template-picker.component.scss'],
})
export class TemplatePickerComponent implements OnInit {
  @Input() loading = false;
  @Output() templateSelected = new EventEmitter<string>();

  private resumeService = inject(ResumeService);
  private sanitizer = inject(DomSanitizer);

  templates: TemplateMetadata[] = [];
  selectedId: string | null = null;

  previewId: string | null = null;
  drawerOpen = false;

  get previewUrl(): SafeResourceUrl {
    const url = this.previewId ? `/api/preview/${this.previewId}` : 'about:blank';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  get previewTemplate(): TemplateMetadata | null {
    return this.templates.find((t) => t.id === this.previewId) ?? null;
  }

  ngOnInit() {
    this.resumeService.getTemplates().subscribe({
      next: ({ templates }) => (this.templates = templates),
      error: () => {
        this.templates = [
          { id: 'classic', name: 'Classic', description: 'Traditional single-column layout.' },
          { id: 'modern', name: 'Modern', description: 'Two-column layout with a dark sidebar.' },
        ];
      },
    });
  }

  openPreview(id: string) {
    this.previewId = id;
    this.drawerOpen = true;
  }

  closeDrawer() {
    this.drawerOpen = false;
  }

  selectFromDrawer() {
    if (this.previewId) this.selectedId = this.previewId;
    this.closeDrawer();
  }

  select(id: string) {
    this.selectedId = id;
    this.openPreview(id);
  }

  generate() {
    if (this.selectedId) {
      this.templateSelected.emit(this.selectedId);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.drawerOpen) this.closeDrawer();
  }
}
