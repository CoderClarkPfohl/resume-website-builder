import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TemplateMetadata, TemplateConfig, ParsedResume } from '../../models/resume.model';
import { ResumeService } from '../../services/resume.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-template-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './template-picker.component.html',
  styleUrls: ['./template-picker.component.scss'],
})
export class TemplatePickerComponent implements OnInit, OnDestroy {
  @Input() loading = false;
  @Input() parsedResume: ParsedResume | null = null;
  @Input() enabledSections: string[] = [];
  @Output() templateSelected = new EventEmitter<{ id: string; config: TemplateConfig }>();
  @Output() back = new EventEmitter<void>();

  private resumeService = inject(ResumeService);
  private sanitizer = inject(DomSanitizer);

  templates: TemplateMetadata[] = [];
  selectedId: string | null = null;

  config: TemplateConfig = { density: 'normal' };

  readonly FONT_PRESETS = [
    { label: 'Default', value: '' },
    { label: 'Inter', value: 'Inter' },
    { label: 'Roboto', value: 'Roboto' },
    { label: 'Open Sans', value: 'Open Sans' },
    { label: 'Lato', value: 'Lato' },
    { label: 'Montserrat', value: 'Montserrat' },
    { label: 'Playfair Display', value: 'Playfair Display' },
    { label: 'Merriweather', value: 'Merriweather' },
    { label: 'Source Sans 3', value: 'Source Sans 3' },
    { label: 'Nunito', value: 'Nunito' },
    { label: 'PT Serif', value: 'PT Serif' },
    { label: 'IBM Plex Sans', value: 'IBM Plex Sans' },
  ];

  readonly ACCENT_PRESETS = [
    { label: 'Default', value: '' },
    { label: 'Blue',    value: '#2563eb' },
    { label: 'Teal',    value: '#0d9488' },
    { label: 'Purple',  value: '#7c3aed' },
    { label: 'Rose',    value: '#e11d48' },
    { label: 'Amber',   value: '#d97706' },
    { label: 'Slate',   value: '#475569' },
  ];

  previewId: string | null = null;
  drawerOpen = false;
  previewLoading = false;
  previewError = false;
  private blobUrls: string[] = [];
  private previewSub: Subscription | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  previewUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');

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
    // Cancel any in-flight preview request
    this.previewSub?.unsubscribe();

    this.previewId = id;
    this.drawerOpen = true;
    this.previewLoading = true;
    this.previewError = false;
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');

    if (this.parsedResume) {
      this.previewSub = this.resumeService
        .previewSite(this.parsedResume, id, this.enabledSections, this.config)
        .subscribe({
          next: (html) => {
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            this.blobUrls.push(url);
            this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            this.previewLoading = false;
          },
          error: () => {
            // Fallback to sample-data preview, but flag the error
            this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`/api/preview/${id}`);
            this.previewLoading = false;
            this.previewError = true;
          },
        });
    } else {
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`/api/preview/${id}`);
      this.previewLoading = false;
    }
  }

  ngOnDestroy() {
    this.previewSub?.unsubscribe();
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.blobUrls.forEach(URL.revokeObjectURL);
  }

  closeDrawer() {
    this.drawerOpen = false;
    this.previewError = false;
  }

  selectFromDrawer() {
    if (this.previewId) this.selectedId = this.previewId;
    this.closeDrawer();
  }

  select(id: string) {
    this.selectedId = id;
    this.openPreview(id);
  }

  setAccent(value: string) {
    this.config = { ...this.config, accentColor: value || undefined };
    this.refreshPreviewDebounced();
  }

  setFont(value: string) {
    this.config = { ...this.config, fontFamily: value || undefined };
    this.refreshPreviewDebounced();
  }

  setDensity(value: 'normal' | 'compact') {
    this.config = { ...this.config, density: value };
    this.refreshPreviewDebounced();
  }

  /** Debounce config-change previews to avoid spamming the server */
  private refreshPreviewDebounced() {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => {
      if (this.drawerOpen && this.previewId) {
        this.openPreview(this.previewId);
      }
    }, 300);
  }

  generate() {
    if (this.selectedId) {
      this.templateSelected.emit({ id: this.selectedId, config: this.config });
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.drawerOpen) this.closeDrawer();
  }
}
