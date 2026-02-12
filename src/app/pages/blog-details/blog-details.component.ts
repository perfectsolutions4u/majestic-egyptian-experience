import { ChangeDetectorRef, Component, inject, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { DataService } from '../../services/data.service';
import { SeoService } from '../../services/seo.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { SocialComponent } from '../../shared/components/social/social.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [BannerComponent, SocialComponent, RouterLink, CommonModule],
  templateUrl: './blog-details.component.html',
  styleUrl: './blog-details.component.scss',
})
export class BlogDetailsComponent implements OnInit {
  constructor(
    private seoService: SeoService,
    private dataService: DataService,
    private _ActivatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  backgroundImage: string = '../../../assets/image/banner.webp';
  blogData: any = {};
  isLoading: boolean = false;
  sanitizer = inject(DomSanitizer);
  settings: any = {};
  blogCategories: any[] = [];
  recentPosts: any[] = [];

  ngOnInit(): void {
    this._ActivatedRoute.params.subscribe((params) => {
      let slug = params['slug'];
      console.log('slug', slug);
      this.dataService.getBlogBySlug(slug).subscribe({
        next: (res) => {
          if (res && res.data) {
            // Use setTimeout to defer update to next change detection cycle
            setTimeout(() => {
              this.blogData = res.data;
              console.log('blogData', this.blogData);
              // Check if tags exists and is a string before splitting
              if (this.blogData.tags && typeof this.blogData.tags === 'string') {
                this.blogData.tags = this.blogData.tags.split(',');
              } else if (!this.blogData.tags) {
                this.blogData.tags = [];
              }
              console.log('tags', this.blogData.tags);

              this.isLoading = true;
              this.cdr.markForCheck();
            }, 0);
          }
        },
        error: (err: any) => {
          console.error('Error fetching blog data:', err);
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
          }, 0);
        },
      });
    });
    this.seoService.updateSeoData(
      {},
      'scrappe voyager - Blog Details',
      'Read the full blog post',
      '../../../assets/image/scrappe-voyager-logo.webp'
    );
    this.getSettings();
    this.getBlogCategories();
    this.getRecentPosts();
  }

  getBlogCategories(): void {
    this.dataService.getBlogCategories().subscribe((res) => {
      // this.blogCategories = res.data.data;
      if (res && res.data) {
        setTimeout(() => {
          this.blogCategories = res.data.data;
          console.log('blog categories', this.blogCategories);
          this.cdr.markForCheck();
        }, 0);
      }
    });
  }

  getRecentPosts(): void {
    this.dataService.getBlogs().subscribe((res) => {
      if (res && res.data) {
        setTimeout(() => {
          this.recentPosts = res.data.data;
          console.log('recent posts', this.recentPosts);
          this.cdr.markForCheck();
        }, 0);
      }
    });
  }

  // get settings from local storage
  getSettings(): void {
    this.settings = localStorage.getItem('scrappe_voyager_settings');
    if (this.settings) {
      let settingsData = JSON.parse(this.settings).data.data;
      // loop through settings and get the social_links
      settingsData.forEach((item: any) => {
        if (item.option_key === 'social_links') {
          this.settings = item.option_value;
        }
      });
    }
    console.log('settings social_links', this.settings);
  }
}
