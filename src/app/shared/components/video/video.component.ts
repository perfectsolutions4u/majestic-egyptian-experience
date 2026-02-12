import {
  Component,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
  Inject,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

declare var bootstrap: any;

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video.component.html',
  styleUrl: './video.component.scss',
})
export class VideoComponent implements OnInit {
  @ViewChild('videoModal') videoModal!: ElementRef;
  @ViewChild('videoIframe') videoIframe!: ElementRef;

  @Input() posterImage: string = '../../../assets/image/3.webp';
  @Input() videoUrl: string = 'https://www.youtube.com/embed/BapSQFJPMM0';
  @Input() posterAlt: string = 'video poster image';

  private baseVideoUrl: string = '';
  private currentVideoUrl: string = '';
  safeVideoUrl: SafeResourceUrl;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private sanitizer: DomSanitizer
  ) {
    this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
  }

  private updateSafeVideoUrl(url: string): void {
    this.currentVideoUrl = url;
    this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  ngOnInit(): void {
    this.baseVideoUrl = this.videoUrl;
    this.updateSafeVideoUrl(this.baseVideoUrl);
  }

  openVideoModal(): void {
    if (isPlatformBrowser(this.platformId) && this.videoModal) {
      this.updateSafeVideoUrl(`${this.baseVideoUrl}?autoplay=1`);

      const modalElement = this.videoModal.nativeElement;
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    }
  }

  closeVideoModal(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.updateSafeVideoUrl('about:blank');

      if (this.videoModal) {
        const modalElement = this.videoModal.nativeElement;
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
      }

      setTimeout(() => {
        this.updateSafeVideoUrl(this.baseVideoUrl);
      }, 300);
    }
  }
}
