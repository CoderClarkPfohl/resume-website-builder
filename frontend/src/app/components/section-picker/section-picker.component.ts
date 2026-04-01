import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericSection } from '../../models/resume.model';
import { SECTION_CATALOG } from '../sections';

@Component({
  selector: 'app-section-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-picker.component.html',
  styleUrls: ['./section-picker.component.scss'],
})
export class SectionPickerComponent implements OnInit {
  @Input() detectedSections: Record<string, GenericSection> = {};
  @Output() sectionsConfirmed = new EventEmitter<string[]>();

  catalog = SECTION_CATALOG;
  enabledKeys = new Set<string>();
  orderedKeys: string[] = [];

  // Drag state
  draggedIndex: number | null = null;
  dragOverIndex: number | null = null;

  ngOnInit() {
    for (const key of Object.keys(this.detectedSections)) {
      this.enabledKeys.add(key);
      this.orderedKeys.push(key);
    }
  }

  isDetected(key: string): boolean {
    return key in this.detectedSections;
  }

  isEnabled(key: string): boolean {
    return this.enabledKeys.has(key);
  }

  getLabelForKey(key: string): string {
    for (const group of this.catalog) {
      for (const item of group.items) {
        if (item.key === key) return item.label;
      }
    }
    return key;
  }

  toggle(key: string) {
    if (this.enabledKeys.has(key)) {
      this.enabledKeys.delete(key);
      this.orderedKeys = this.orderedKeys.filter((k) => k !== key);
    } else {
      this.enabledKeys.add(key);
      this.orderedKeys.push(key);
    }
  }

  selectAll() {
    for (const group of this.catalog) {
      for (const item of group.items) {
        if (this.isDetected(item.key) && !this.enabledKeys.has(item.key)) {
          this.enabledKeys.add(item.key);
          this.orderedKeys.push(item.key);
        }
      }
    }
  }

  deselectAll() {
    this.enabledKeys.clear();
    this.orderedKeys = [];
  }

  // --- Drag-to-reorder ---

  onDragStart(event: DragEvent, index: number) {
    this.draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      // Invisible drag image so the item itself provides visual feedback
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  onDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.dragOverIndex = index;
  }

  onDrop(event: DragEvent, index: number) {
    event.preventDefault();
    if (this.draggedIndex === null || this.draggedIndex === index) {
      this.draggedIndex = null;
      this.dragOverIndex = null;
      return;
    }
    const dragged = this.orderedKeys[this.draggedIndex];
    this.orderedKeys.splice(this.draggedIndex, 1);
    this.orderedKeys.splice(index, 0, dragged);
    this.draggedIndex = null;
    this.dragOverIndex = null;
  }

  onDragEnd() {
    this.draggedIndex = null;
    this.dragOverIndex = null;
  }

  confirm() {
    // Emit in the user's drag-defined order
    this.sectionsConfirmed.emit([...this.orderedKeys]);
  }

  get enabledCount(): number {
    return this.orderedKeys.length;
  }

  get detectedCount(): number {
    return Object.keys(this.detectedSections).length;
  }

  hasDetectedInCategory(category: { items: Array<{ key: string }> }): boolean {
    return category.items.some((item) => this.isDetected(item.key));
  }

  hasUndetectedInCategory(category: { items: Array<{ key: string }> }): boolean {
    return category.items.some((item) => !this.isDetected(item.key));
  }
}
