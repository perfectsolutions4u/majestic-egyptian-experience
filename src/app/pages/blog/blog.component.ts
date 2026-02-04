import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { SeoService } from '../../services/seo.service';
import { IBlog } from '../../core/interfaces/iblog';
import { DataService } from '../../services/data.service';
import { BlogCartComponent } from '../../shared/components/blog-cart/blog-cart.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { isPlatformBrowser } from '@angular/common';
import { tap, finalize } from 'rxjs';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [BannerComponent, BlogCartComponent, PaginationComponent],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss',
})
export class BlogComponent implements OnInit {
  constructor(
    private seoService: SeoService,
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  backgroundImage: string = '../../../assets/image/banner.webp';
  listBlog: IBlog[] = [];
  hasLoaded: boolean = false; // Track if data has been loaded
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
      'majestic - Blog',
      'Explore our latest travel insights and stories.',
      '../../../assets/image/majestic-logo.svg'
    );
    this.getListBlog();
  }

  getListBlog(page: number = 1) {
    this.dataService
      .getBlogs(page)
      .pipe(
        tap((res) => {
          // Update data
          this.listBlog = res.data?.data || [];
          console.log('listBlog', this.listBlog);
          this.apiResponse = {
            current_page: res.data?.current_page || 1,
            total: res.data?.total || 0,
            from: res.data?.from || 0,
            to: res.data?.to || 0,
            per_page: res.data?.per_page || 15,
          };
          this.hasLoaded = true;

          // Trigger change detection for SSR compatibility
          if (isPlatformBrowser(this.platformId)) {
            // Use setTimeout for browser to defer to next change detection cycle
            setTimeout(() => {
              this.cdr.markForCheck();
            }, 0);
          } else {
            // For SSR, use detectChanges directly
            this.cdr.detectChanges();
          }
        }),
        finalize(() => {
          // Ensure change detection runs even if there's an error
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          // Data already handled in tap operator
        },
        error: (err) => {
          console.error('Error fetching blogs:', err);
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
