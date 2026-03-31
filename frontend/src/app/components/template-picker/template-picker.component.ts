import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  templates: TemplateMetadata[] = [];
  selectedId: string | null = null;

  ngOnInit() {
    this.resumeService.getTemplates().subscribe({
      next: ({ templates }) => (this.templates = templates),
      error: () => {
        // Fallback if templates endpoint fails
        this.templates = [
          { id: 'classic', name: 'Classic', description: 'Traditional single-column layout.' },
          { id: 'modern', name: 'Modern', description: 'Two-column layout with a dark sidebar.' },
        ];
      },
    });
  }

  select(id: string) {
    this.selectedId = id;
  }

  generate() {
    if (this.selectedId) {
      this.templateSelected.emit(this.selectedId);
    }
  }
}
