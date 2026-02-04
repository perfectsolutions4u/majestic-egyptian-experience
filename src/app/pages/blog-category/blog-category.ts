import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { BlogCartComponent } from '../../shared/components/blog-cart/blog-cart.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SeoService } from '../../services/seo.service';
import { DataService } from '../../services/data.service';
import { IBlog } from '../../core/interfaces/iblog';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { tap, finalize } from 'rxjs';

@Component({
  selector: 'app-blog-category',
  standalone: true,
  imports: [CommonModule, BannerComponent, BlogCartComponent, PaginationComponent],
  templateUrl: './blog-category.component.html',
  styleUrl: './blog-category.component.scss',
})
export class BlogCategory implements OnInit {
  constructor(
    private seoService: SeoService,
    private dataService: DataService,
    private _ActivatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  backgroundImage: string = '../../../assets/image/banner.webp';
  listBlog: IBlog[] = [];
  hasLoaded: boolean = false;
  categoryId: string | null = null;
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
      'majestic - Blog Category',
      'Explore blogs by category.',
      '../../../assets/image/majestic-logo.svg'
    );

    this._ActivatedRoute.params.subscribe((params) => {
      this.categoryId = params['id'];
      this.getListBlog();
    });
  }

  getListBlog(page: number = 1) {
    if (!this.categoryId) return;

    this.dataService
      .getBlogCategoriesDetails(Number(this.categoryId))
      .pipe(
        tap((res) => {
          this.listBlog = res.data?.blogs?.data || res.data?.blogs || [];
          console.log('listBlog by category', this.listBlog);
          this.apiResponse = {
            current_page: res.data?.blogs?.current_page || res.data?.current_page || 1,
            total: res.data?.blogs?.total || res.data?.total || 0,
            from: res.data?.blogs?.from || res.data?.from || 0,
            to: res.data?.blogs?.to || res.data?.to || 0,
            per_page: res.data?.blogs?.per_page || res.data?.per_page || 15,
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
          console.error('Error fetching blogs by category:', err);
          this.listBlog = [];
          this.hasLoaded = true;
          this.cdr.markForCheck();
        },
      });
  }

  onPageChange(page: number): void {
    this.getListBlog(page);
  }
}
