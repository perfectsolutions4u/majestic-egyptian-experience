import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../services/seo.service';
import { DataService } from '../../services/data.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FaqContent } from '../../shared/components/faq-content/faq-content.component';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [BannerComponent, CommonModule, FaqContent],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent implements OnInit {
  backgroundImage: string = '../../../assets/image/banner.webp';
  faqs: any[] = [];
  openIndex: number | null = null;
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  constructor(private seoService: SeoService, private _DataService: DataService) {}

  ngOnInit(): void {
    this.seoService.updateSeoData(
      {},
      'majestic - FAQ',
      'Frequently asked questions',
      '../../../assets/image/majestic-logo.svg'
    );
  }
}
