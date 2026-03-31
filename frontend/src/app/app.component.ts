import { Component } from '@angular/core';
import { UploadComponent } from './components/upload/upload.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UploadComponent],
  template: '<app-upload />',
})
export class AppComponent {}
