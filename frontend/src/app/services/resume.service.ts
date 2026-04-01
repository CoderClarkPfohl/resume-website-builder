import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  UploadResponse,
  GenerateResponse,
  DeployResponse,
  ParsedResume,
  TemplateMetadata,
  TemplateConfig,
} from '../models/resume.model';

@Injectable({ providedIn: 'root' })
export class ResumeService {
  private http = inject(HttpClient);

  uploadResume(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('resume', file);
    return this.http.post<UploadResponse>('/api/upload', formData);
  }

  generateSite(
    parsed: ParsedResume,
    templateId: string,
    enabledSections: string[],
    config: TemplateConfig = {}
  ): Observable<GenerateResponse> {
    return this.http.post<GenerateResponse>('/api/generate', {
      parsed,
      templateId,
      enabledSections,
      config,
    });
  }

  previewSite(
    parsed: ParsedResume,
    templateId: string,
    enabledSections: string[],
    config: TemplateConfig = {}
  ): Observable<string> {
    return this.http.post('/api/preview', { parsed, templateId, enabledSections, config }, {
      responseType: 'text',
    });
  }

  getTemplates(): Observable<{ templates: TemplateMetadata[] }> {
    return this.http.get<{ templates: TemplateMetadata[] }>('/api/templates');
  }

  deploySite(siteId: string, repoName: string): Observable<DeployResponse> {
    return this.http.post<DeployResponse>('/api/deploy', { siteId, repoName });
  }

  getDownloadUrl(siteId: string): string {
    return `/api/download/${siteId}`;
  }
}
