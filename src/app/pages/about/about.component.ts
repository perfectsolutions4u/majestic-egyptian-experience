import {
  Component,
  OnInit,
  inject,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { SeoService } from '../../services/seo.service';
import { BestServices } from '../../shared/components/best-services/best-services';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Parteners } from '../../shared/components/parteners/parteners';

declare var bootstrap: any;

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [BannerComponent, BestServices, CommonModule, Parteners],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit {
  @ViewChild('videoModal') videoModal!: ElementRef;
  @ViewChild('videoIframe') videoIframe!: ElementRef;
  backgroundImage: string = '../../../assets/image/banner.webp';
  private seoService = inject(SeoService);
  private sanitizer = inject(DomSanitizer);

  private readonly baseVideoUrl: string = 'https://www.youtube.com/embed/BapSQFJPMM0';
  videoUrl: string = this.baseVideoUrl;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.seoService.updateSeoData(
      {},
      'majestic - About Us',
      'Learn more about us',
      '../../../assets/image/majestic-logo.svg'
    );
  }

  get safeVideoUrl(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.videoUrl);
  }

  openVideoModal(): void {
    if (isPlatformBrowser(this.platformId) && this.videoModal) {
      // إضافة autoplay عند فتح الـ modal
      this.videoUrl = `${this.baseVideoUrl}?autoplay=1`;

      const modalElement = this.videoModal.nativeElement;
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    }
  }

  closeVideoModal(): void {
    if (isPlatformBrowser(this.platformId)) {
      // إيقاف الفيديو عن طريق تغيير src إلى رابط فارغ
      this.videoUrl = 'about:blank';

      if (this.videoModal) {
        const modalElement = this.videoModal.nativeElement;
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
      }

      // إعادة تعيين الرابط بعد إغلاق الـ modal
      setTimeout(() => {
        this.videoUrl = this.baseVideoUrl;
      }, 300);
    }
  }
}
