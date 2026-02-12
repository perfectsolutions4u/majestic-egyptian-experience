import { Component, OnInit, inject } from '@angular/core';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { SeoService } from '../../services/seo.service';
import { BestServices } from '../../shared/components/best-services/best-services.component';
import { CommonModule } from '@angular/common';
import { Parteners } from '../../shared/components/parteners/parteners.component';
import { VideoComponent } from '../../shared/components/video/video.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [BannerComponent, BestServices, CommonModule, Parteners, VideoComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit {
  backgroundImage: string = '../../../assets/image/banner.webp';
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.updateSeoData(
      {},
      'scrappe voyager - About Us',
      'Learn more about us',
      '../../../assets/image/scrappe-voyager-logo.webp'
    );
  }
}
