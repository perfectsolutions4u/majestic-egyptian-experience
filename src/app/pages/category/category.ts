import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { TourCartComponent } from '../../shared/components/tour-cart/tour-cart.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SeoService } from '../../services/seo.service';
import { DataService } from '../../services/data.service';
import { Itour } from '../../core/interfaces/itour';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { tap, finalize } from 'rxjs';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, BannerComponent, TourCartComponent, PaginationComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
})
export class Category implements OnInit {
  constructor(
    private seoService: SeoService,
    private dataService: DataService,
    private _ActivatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  backgroundImage: string = '../../../assets/image/banner.webp';
  listTours: Itour[] = [];
  hasLoaded: boolean = false;
  categorySlug: string | null = null;
  apiResponse: any = {
    current_page: 1,
    total: 0,
    from: 0,
    to: 0,
    per_page: 15,
  };

  ngOnInit(): void {
    this.seoService.updateSeoData(
      {},
      'majestic - Category',
      'Explore tours by category.',
      '../../../assets/image/majestic-logo.svg'
    );

    this._ActivatedRoute.params.subscribe((params) => {
      this.categorySlug = params['slug'];
      this.getListTours();
    });
  }

  getListTours(page: number = 1) {
    if (!this.categorySlug) return;

    this.dataService
      .getTours({ category: this.categorySlug }, page)
      .pipe(
        tap((res) => {
          this.listTours = res.data?.data || [];
          console.log('listTours by category', this.listTours);
          this.apiResponse = {
            current_page: res.data?.current_page || 1,
            total: res.data?.total || 0,
            from: res.data?.from || 0,
            to: res.data?.to || 0,
            per_page: res.data?.per_page || 15,
          };
          this.hasLoaded = true;

          if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => {
              this.cdr.markForCheck();
            }, 0);
          } else {
            this.cdr.detectChanges();
          }
        }),
        finalize(() => {
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          // Data already handled in tap operator
        },
        error: (err) => {
          console.error('Error fetching tours by category:', err);
          this.listTours = [];
          this.hasLoaded = true;
          this.cdr.markForCheck();
        },
      });
  }

  onPageChange(page: number): void {
    this.getListTours(page);
  }
}
