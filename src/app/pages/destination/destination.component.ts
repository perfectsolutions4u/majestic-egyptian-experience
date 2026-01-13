import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { SeoService } from '../../services/seo.service';
import { DataService } from '../../services/data.service';
import { IDestination } from '../../core/interfaces/idestination';
import { DestinationCartComponent } from '../../shared/components/destination-cart/destination-cart.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { CommonModule } from '@angular/common';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { isPlatformBrowser } from '@angular/common';
import { tap, finalize } from 'rxjs';

@Component({
  selector: 'app-destination',
  standalone: true,
  imports: [CommonModule, DestinationCartComponent, PaginationComponent, BannerComponent],
  templateUrl: './destination.component.html',
  styleUrl: './destination.component.scss',
})
export class DestinationComponent implements OnInit {
  constructor(
    private seoService: SeoService,
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  backgroundImage: string = '../../../assets/image/banner.webp';
  allDestinations: IDestination[] = [];
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
      'majestic - Destination',
      'Explore our destinations',
      '../../../assets/image/majestic-logo.svg'
    );
    this.getDestination();
  }

  getDestination(page: number = 1) {
    const cachedDestinations = this.dataService.getFromLocalStorage('majestic_destinations');
    if (cachedDestinations?.data?.data) {
      this.allDestinations = cachedDestinations.data.data.data || [];
      this.hasLoaded = true;
      // Trigger change detection for cached data
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          this.cdr.markForCheck();
        }, 0);
      }
    } else {
      this.dataService
        .getDestination(page)
        .pipe(
          tap((res) => {
            // Update data
            this.allDestinations = res.data?.data || [];
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
            console.error('Error fetching destinations:', err);
            this.allDestinations = [];
            this.hasLoaded = true;
            this.cdr.markForCheck();
          },
        });
    }
  }

  onPageChange(page: number): void {
    this.getDestination(page);
  }
}
