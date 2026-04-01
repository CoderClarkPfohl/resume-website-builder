import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ResumeService } from '../../services/resume.service';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
})
export class ResultComponent {
  private sanitizer = inject(DomSanitizer);
  private resumeService = inject(ResumeService);

  private _siteUrl = '';
  safeUrl: SafeResourceUrl = '';

  @Input() siteId = '';

  @Input() set siteUrl(url: string) {
    this._siteUrl = url;
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  get siteUrl() { return this._siteUrl; }

  @Output() startOver = new EventEmitter<void>();
  @Output() changeTemplate = new EventEmitter<void>();

  copied = false;
  repoName = '';
  deploying = false;
  deployError = '';
  repoUrl = '';
  netlifyUrl = '';

  get downloadUrl(): string {
    return this.resumeService.getDownloadUrl(this.siteId);
  }

  copyUrl() {
    navigator.clipboard.writeText(this.siteUrl).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }

  deploy() {
    if (!this.repoName.trim() || !this.siteId) return;

    this.deploying = true;
    this.deployError = '';

    this.resumeService.deploySite(this.siteId, this.repoName.trim()).subscribe({
      next: (res) => {
        this.repoUrl = res.repoUrl;
        this.netlifyUrl = res.netlifyUrl;
        this.deploying = false;
      },
      error: (err) => {
        this.deployError = err?.error?.error ?? 'Deploy failed. Check your API tokens.';
        this.deploying = false;
      },
    });
  }
}
