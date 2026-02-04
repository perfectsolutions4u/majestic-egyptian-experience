import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

// Note: ngx-dropzone-next components must be imported in the component that uses them
// We use CUSTOM_ELEMENTS_SCHEMA here to allow the custom element syntax
// The actual components will be loaded via dynamic import or imported in the parent

@Component({
  selector: 'app-ngx-dropzone',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ngx-dropzone 
      [accept]="accept" 
      [multiple]="multiple"
      [expandable]="expandable"
      [maxFileSize]="maxFileSize"
      [maxFiles]="maxFiles"
      [disabled]="disabled"
      (change)="change.emit($event)"
      (error)="error.emit($event)"
      [ngClass]="ngClass"
      [ngStyle]="ngStyle">
      <ng-content></ng-content>
    </ngx-dropzone>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NgxDropzoneWrapperComponent {
  @Input() accept?: string;
  @Input() multiple?: boolean;
  @Input() expandable?: boolean;
  @Input() maxFileSize?: number;
  @Input() maxFiles?: number;
  @Input() disabled?: boolean;
  @Input() ngClass?: any;
  @Input() ngStyle?: any;
  @Output() change = new EventEmitter();
  @Output() error = new EventEmitter();
}

@Component({
  selector: 'app-ngx-dropzone-label',
  standalone: true,
  imports: [CommonModule],
  template: '<ng-content></ng-content>',
})
export class NgxDropzoneLabelWrapperComponent {}

@Component({
  selector: 'app-ngx-dropzone-image-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ngx-dropzone-image-preview
      [file]="file"
      [removable]="removable"
      (removed)="removed.emit($event)"
      [ngClass]="ngClass">
    </ngx-dropzone-image-preview>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NgxDropzoneImagePreviewWrapperComponent {
  @Input() file?: File;
  @Input() removable?: boolean;
  @Input() ngClass?: any;
  @Output() removed = new EventEmitter();
}

// Export with the original names for compatibility
export const NgxDropzoneComponent = NgxDropzoneWrapperComponent;
export const NgxDropzoneLabelDirective = NgxDropzoneLabelWrapperComponent;
export const NgxDropzoneImagePreviewComponent = NgxDropzoneImagePreviewWrapperComponent;
