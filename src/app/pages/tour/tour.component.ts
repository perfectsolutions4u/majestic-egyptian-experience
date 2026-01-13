import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../services/seo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ICategory } from '../../core/interfaces/icategory';
import { IDestination } from '../../core/interfaces/idestination';
import { IDuration } from '../../core/interfaces/iduration';
import { Category, Destination, Itour } from '../../core/interfaces/itour';
import { DataService } from '../../services/data.service';
import { TourCartComponent } from '../../shared/components/tour-cart/tour-cart.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-tour',
  standalone: true,
  imports: [TourCartComponent, PaginationComponent, CommonModule, FormsModule],
  templateUrl: './tour.component.html',
  styleUrl: './tour.component.scss',
})
export class TourComponent implements OnInit {
  isBrowser: boolean;

  constructor(
    private seoService: SeoService,
    private _ActivatedRoute: ActivatedRoute,
    private _DataService: DataService,
    private _Router: Router,
    private _cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // Helper method to get data from localStorage
  private getFromLocalStorage(key: string): any | null {
    if (!this.isBrowser) {
      return null;
    }
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn(`Error reading from localStorage for key ${key}:`, error);
      return null;
    }
  }

  layoutType: 'grid' | 'list' = 'grid';
  isLoading: boolean = false;
  sidebarOpen: boolean = false;
  openFilterSection: string = 'destinations'; // Default: first item is open

  // IDs (للاستخدام الداخلي)
  selectedDestination: number | null = null;
  selectedTripType: number | null = null;
  selectedDuration: number | null = null;

  // Slugs (للاستخدام في URL والـ API)
  selectedDestinationSlug: string | null = null;
  selectedCategorySlug: string | null = null;
  selectedDurationSlug: string | null = null;

  // Track if "Select All" is active for each filter
  isSelectAllDestinations: boolean = false;
  isSelectAllCategories: boolean = false;
  isSelectAllDurations: boolean = false;

  // Pagination variables
  itemsPerPage: number = 15;
  allToursCount: number = 0;
  paginationFrom: number = 0;
  paginationTo: number = 0;
  paginationCurrentPage: number = 1;

  allCategories: ICategory[] = [];
  allDestinations: IDestination[] = [];
  allDurations: IDuration[] = [];
  allTours: Itour[] = [];

  // Ensure arrays are always arrays (safety getters)
  get safeCategories(): ICategory[] {
    return Array.isArray(this.allCategories) ? this.allCategories : [];
  }

  get safeDestinations(): IDestination[] {
    return Array.isArray(this.allDestinations) ? this.allDestinations : [];
  }

  get safeDurations(): IDuration[] {
    return Array.isArray(this.allDurations) ? this.allDurations : [];
  }
  totalItems: number = 0;
  currentPage: number = 1;
  filteredTours: Itour[] = [];
  minBudget: number = 0;
  maxBudget: number = 5000;

  ngOnInit(): void {
    this.seoService.updateSeoData(
      {},
      'Majestic Egyption Experience - Tours',
      'Search and discover amazing tours with Majestic Egyption Experience. Your trusted travel partner for premium tours and exceptional travel experiences.',
      '../../../assets/image/majestic-logo.svg'
    );

    // Load destinations, categories, and durations
    this.getDestinations();
    this.getCategories();
    this.getDurations();

    // Subscribe to query params to read filters from URL
    this._ActivatedRoute.queryParams.subscribe((param) => {
      console.log('Query params changed:', param);

      // Handle destination filter from URL
      if (param['location']) {
        this.selectedDestinationSlug = param['location'];
        // Find ID from loaded destinations
        const destination = this.allDestinations.find((dest) => dest.slug === param['location']);
        if (destination) {
          this.selectedDestination = destination.id;
        } else {
          // If destinations not loaded yet, will be handled in getDestinations()
          this.selectedDestination = null;
        }
      } else {
        this.selectedDestinationSlug = null;
        this.selectedDestination = null;
      }

      // Handle category filter from URL
      if (param['type']) {
        this.selectedCategorySlug = param['type'];
        const category = this.allCategories.find((cat) => cat.slug === param['type']);
        if (category) {
          this.selectedTripType = category.id;
        } else {
          this.selectedTripType = null;
        }
      } else {
        this.selectedCategorySlug = null;
        this.selectedTripType = null;
      }

      // Handle duration filter from URL (support both ID and slug)
      if (param['duration']) {
        const durationParam = param['duration'];
        const isNumeric = !isNaN(Number(durationParam));

        if (isNumeric) {
          // Old format (ID) - convert to slug
          this.selectedDuration = Number(durationParam);
          const duration = this.allDurations.find((dur) => dur.id === Number(durationParam));
          this.selectedDurationSlug = duration?.slug || null;
        } else {
          // New format (slug)
          this.selectedDurationSlug = durationParam;
          const duration = this.allDurations.find((dur) => dur.slug === durationParam);
          if (duration) {
            this.selectedDuration = duration.id;
          } else {
            this.selectedDuration = null;
          }
        }
      } else {
        this.selectedDurationSlug = null;
        this.selectedDuration = null;
      }

      // Update price range from query params if present
      if (param['minPrice']) {
        this.minBudget = Number(param['minPrice']) || 0;
      } else {
        this.minBudget = 0;
      }
      if (param['maxPrice']) {
        this.maxBudget = Number(param['maxPrice']) || 5000;
      } else {
        this.maxBudget = 5000;
      }

      // Fetch tours with filters (start from page 1 when filters change from URL)
      this.currentPage = 1;
      this.paginationCurrentPage = 1;
      this.getAllTours(1);
    });
  }

  getDestinations(): void {
    const cachedDestinations = this.getFromLocalStorage('majestic_destinations');
    if (cachedDestinations?.data?.data) {
      setTimeout(() => {
        this.allDestinations = cachedDestinations.data.data.data;

        // If there's a slug from URL but ID wasn't set yet, find it now
        if (this.selectedDestinationSlug && this.selectedDestination === null) {
          const destination = this.allDestinations.find(
            (dest) => dest.slug === this.selectedDestinationSlug
          );
          if (destination) {
            this.selectedDestination = destination.id;
            this.getAllTours(1); // Re-fetch tours with the filter
          }
        }

        this._cdr.markForCheck();
      }, 0);
    } else {
      this._DataService.getDestination().subscribe({
        next: (res) => {
          setTimeout(() => {
            if (res?.data?.data) {
              this.allDestinations = res.data.data;
              console.log('allDestinations', this.allDestinations);
              // If there's a slug from URL but ID wasn't set yet, find it now
              if (this.selectedDestinationSlug && this.selectedDestination === null) {
                const destination = this.allDestinations.find(
                  (dest) => dest.slug === this.selectedDestinationSlug
                );
                if (destination) {
                  this.selectedDestination = destination.id;
                  this.getAllTours(); // Re-fetch tours with the filter
                }
              }
            }
            this._cdr.markForCheck();
          }, 0);
        },
        error: (err) => {
          console.error('Error loading destinations:', err);
        },
      });
    }
  }

  getCategories(): void {
    const cachedCategories = this.getFromLocalStorage('majestic_categories');
    if (cachedCategories?.data?.data && Array.isArray(cachedCategories.data.data)) {
      setTimeout(() => {
        this.allCategories = cachedCategories.data.data;

        // If there's a slug from URL but ID wasn't set yet, find it now
        if (this.selectedCategorySlug && this.selectedTripType === null) {
          const category = this.allCategories.find((cat) => cat.slug === this.selectedCategorySlug);
          if (category) {
            this.selectedTripType = category.id;
            this.getAllTours(1); // Re-fetch tours with the filter
          }
        }

        this._cdr.markForCheck();
      }, 0);
    } else {
      this._DataService.getCategory().subscribe({
        next: (res) => {
          setTimeout(() => {
            if (res?.data?.data && Array.isArray(res.data.data)) {
              this.allCategories = res.data.data;

              // If there's a slug from URL but ID wasn't set yet, find it now
              if (this.selectedCategorySlug && this.selectedTripType === null) {
                const category = this.allCategories.find(
                  (cat) => cat.slug === this.selectedCategorySlug
                );
                if (category) {
                  this.selectedTripType = category.id;
                  this.getAllTours(); // Re-fetch tours with the filter
                }
              }
            } else {
              // Fallback: ensure it's always an array
              this.allCategories = [];
            }
            this._cdr.markForCheck();
          }, 0);
        },
        error: (err) => {
          console.error('Error loading categories:', err);
          setTimeout(() => {
            this.allCategories = [];
            this._cdr.markForCheck();
          }, 0);
        },
      });
    }
  }

  getDurations(): void {
    const cachedDurations = this.getFromLocalStorage('majestic_durations');
    // Durations might be stored directly as array or nested in data.data
    if (cachedDurations?.data) {
      setTimeout(() => {
        // Check if it's an array directly or nested
        if (Array.isArray(cachedDurations.data)) {
          this.allDurations = cachedDurations.data;
        } else if (Array.isArray(cachedDurations.data.data)) {
          this.allDurations = cachedDurations.data.data;
        } else {
          this.allDurations = [];
        }

        // If there's a slug from URL but ID wasn't set yet, find it now
        if (this.selectedDurationSlug && this.selectedDuration === null) {
          const duration = this.allDurations.find((dur) => dur.slug === this.selectedDurationSlug);
          if (duration) {
            this.selectedDuration = duration.id;
            this.getAllTours(1); // Re-fetch tours with the filter
          }
        }

        this._cdr.markForCheck();
      }, 0);
    } else {
      this._DataService.getDurations().subscribe({
        next: (res) => {
          setTimeout(() => {
            // Check if it's an array directly or nested
            if (Array.isArray(res?.data)) {
              this.allDurations = res.data;
            } else if (Array.isArray(res?.data?.data)) {
              this.allDurations = res.data.data;
            } else {
              this.allDurations = [];
            }

            // If there's a slug from URL but ID wasn't set yet, find it now
            if (this.selectedDurationSlug && this.selectedDuration === null) {
              const duration = this.allDurations.find(
                (dur) => dur.slug === this.selectedDurationSlug
              );
              if (duration) {
                this.selectedDuration = duration.id;
                this.getAllTours(); // Re-fetch tours with the filter
              }
            }

            this._cdr.markForCheck();
          }, 0);
        },
        error: (err) => {
          console.error('Error loading durations:', err);
          setTimeout(() => {
            this.allDurations = [];
            this._cdr.markForCheck();
          }, 0);
        },
      });
    }
  }

  // Server-Side Filtering: Fetch tours with filters from API
  getAllTours(page: number = 1): void {
    this.isLoading = true;

    // Build query parameters with slugs for API
    const queryParams: any = {
      category_slug: this.selectedCategorySlug || '',
      destination_slug: this.selectedDestinationSlug || '',
      duration_slug: this.selectedDurationSlug || '',
    };

    // Remove empty filters
    Object.keys(queryParams).forEach((key) => {
      if (!queryParams[key]) {
        delete queryParams[key];
      }
    });

    this._DataService.getTours(queryParams, page).subscribe({
      next: (res) => {
        setTimeout(() => {
          if (res?.data?.data) {
            this.allTours = res.data.data;

            // Calculate totalItems from API response
            if (res.data.total !== undefined) {
              this.totalItems = Number(res.data.total);
            } else if (res.data.last_page && res.data.per_page) {
              // Calculate from last_page and per_page
              this.totalItems = Number(res.data.last_page) * Number(res.data.per_page);
            } else {
              // Fallback: if we have 15 items, there might be more
              this.totalItems =
                res.data.data.length >= 15 ? res.data.data.length + 1 : res.data.data.length;
            }

            this.allToursCount = this.totalItems;

            // Store pagination data from API response
            this.paginationCurrentPage = res.data.current_page || page;
            this.itemsPerPage = res.data.per_page || 15;
            this.paginationFrom = res.data.from || 0;
            this.paginationTo = res.data.to || 0;

            // Process tours: add destinationsTitle
            this.allTours.forEach((tour: any) => {
              tour.destinationsTitle = tour.destinations?.map((x: any) => x.title).join(', ');
            });

            // Apply client-side sorting if needed (sorting is done on filteredTours)
            this.filteredTours = [...this.allTours];
            this.currentPage = page;

            // Apply price filter if needed (client-side)
            this.applyPriceFilter();

            console.log('✅ Tours loaded:', this.allTours.length, 'Total:', this.totalItems);
          } else {
            console.warn('⚠️ No tours data in response:', res);
            this.allTours = [];
            this.filteredTours = [];
            this.totalItems = 0;
            this.paginationFrom = 0;
            this.paginationTo = 0;
            this.paginationCurrentPage = 1;
          }

          this.isLoading = false;
          this._cdr.markForCheck();
        }, 0);
      },
      error: (err) => {
        console.error('❌ Error loading tours:', err);
        setTimeout(() => {
          this.allTours = [];
          this.filteredTours = [];
          this.totalItems = 0;
          this.paginationFrom = 0;
          this.paginationTo = 0;
          this.paginationCurrentPage = 1;
          this.isLoading = false;
          this._cdr.markForCheck();
        }, 0);
      },
    });
  }

  // Note: filterTours() removed - using Server-Side Filtering via getAllTours()
  // Price filtering can be done client-side if needed, but main filters are server-side

  onRadioChange(
    key: 'selectedTripType' | 'selectedDuration' | 'selectedDestination',
    value: number | null
  ) {
    // 1. Update the ID value
    this[key] = value;

    // 2. Convert ID to Slug
    if (key === 'selectedTripType') {
      if (value !== null) {
        const category = this.allCategories.find((cat) => cat.id === value);
        this.selectedCategorySlug = category?.slug || null;
      } else {
        this.selectedCategorySlug = null;
      }
      this.isSelectAllCategories = false;
    } else if (key === 'selectedDuration') {
      if (value !== null) {
        const duration = this.allDurations.find((dur) => dur.id === value);
        this.selectedDurationSlug = duration?.slug || null;
      } else {
        this.selectedDurationSlug = null;
      }
      this.isSelectAllDurations = false;
    } else if (key === 'selectedDestination') {
      if (value !== null) {
        const destination = this.allDestinations.find((dest) => dest.id === value);
        this.selectedDestinationSlug = destination?.slug || null;
      } else {
        this.selectedDestinationSlug = null;
      }
      this.isSelectAllDestinations = false;
    }

    // 3. Reset to page 1 when filters change
    this.currentPage = 1;
    this.paginationCurrentPage = 1;

    // 4. Re-fetch tours with new filters
    this.getAllTours(1);

    // 5. Update URL
    this.updateQueryParams();
  }

  // Select all for destinations - clears filter (shows all)
  selectAllDestinations() {
    if (this.isSelectAllDestinations) {
      // If already selected, clear selection
      this.isSelectAllDestinations = false;
      this.selectedDestinationSlug = null;
      this.selectedDestination = null;
    } else {
      // Set Select All as active (no filter)
      this.isSelectAllDestinations = true;
      this.selectedDestinationSlug = null;
      this.selectedDestination = null;
    }
    this.currentPage = 1;
    this.paginationCurrentPage = 1;
    this.getAllTours(1);
    this.updateQueryParams();
  }

  // Select all for categories - clears filter (shows all)
  selectAllCategories() {
    if (this.isSelectAllCategories) {
      // If already selected, clear selection
      this.isSelectAllCategories = false;
      this.selectedCategorySlug = null;
      this.selectedTripType = null;
    } else {
      // Set Select All as active (no filter)
      this.isSelectAllCategories = true;
      this.selectedCategorySlug = null;
      this.selectedTripType = null;
    }
    this.currentPage = 1;
    this.paginationCurrentPage = 1;
    this.getAllTours(1);
    this.updateQueryParams();
  }

  // Select all for durations - clears filter (shows all)
  selectAllDurations() {
    if (this.isSelectAllDurations) {
      // If already selected, clear selection
      this.isSelectAllDurations = false;
      this.selectedDurationSlug = null;
      this.selectedDuration = null;
    } else {
      // Set Select All as active (no filter)
      this.isSelectAllDurations = true;
      this.selectedDurationSlug = null;
      this.selectedDuration = null;
    }
    this.currentPage = 1;
    this.paginationCurrentPage = 1;
    this.getAllTours(1);
    this.updateQueryParams();
  }

  setLayout(type: 'grid' | 'list') {
    this.layoutType = type;
  }

  onPriceRangeChange() {
    // Price filtering is client-side (can be changed to server-side if API supports it)
    // For now, we'll filter client-side after fetching
    this.updateQueryParams();
    this.applyPriceFilter();
  }

  // Apply price filter client-side (since API might not support price filtering)
  applyPriceFilter() {
    if (this.minBudget > 0 || this.maxBudget < 5000) {
      this.filteredTours = this.allTours.filter((tour) => {
        let price = 0;
        if (tour.start_from) {
          price = Number(tour.start_from);
        } else if (tour.adult_price) {
          price = Number(tour.adult_price);
        }
        return price >= this.minBudget && (this.maxBudget === 0 || price <= this.maxBudget);
      });
    } else {
      this.filteredTours = [...this.allTours];
    }
  }

  // Method to clear all filters
  clearAllFilters() {
    this.selectedCategorySlug = null;
    this.selectedDestinationSlug = null;
    this.selectedDurationSlug = null;
    this.selectedTripType = null;
    this.selectedDestination = null;
    this.selectedDuration = null;
    this.isSelectAllDestinations = false;
    this.isSelectAllCategories = false;
    this.isSelectAllDurations = false;
    this.minBudget = 0;
    this.maxBudget = 5000;
    this.currentPage = 1;
    this.paginationCurrentPage = 1;
    this.getAllTours(1);
    this.updateQueryParams();
  }

  removeAllDestinations() {
    this.selectedDestinationSlug = null;
    this.selectedDestination = null;
    this.isSelectAllDestinations = false;
    this.currentPage = 1;
    this.paginationCurrentPage = 1;
    this.getAllTours(1);
    this.updateQueryParams();
  }

  removeAllCategories() {
    this.selectedCategorySlug = null;
    this.selectedTripType = null;
    this.isSelectAllCategories = false;
    this.currentPage = 1;
    this.paginationCurrentPage = 1;
    this.getAllTours(1);
    this.updateQueryParams();
  }

  removeAllDurations() {
    this.selectedDurationSlug = null;
    this.selectedDuration = null;
    this.isSelectAllDurations = false;
    this.currentPage = 1;
    this.paginationCurrentPage = 1;
    this.getAllTours(1);
    this.updateQueryParams();
  }

  removeAllPrices() {
    this.minBudget = 0;
    this.maxBudget = 5000;
    this.applyPriceFilter();
    this.updateQueryParams();
  }

  // Update URL query params based on current filter state
  updateQueryParams(): void {
    const queryParams: any = {};

    // Add destination filter (slug)
    if (this.selectedDestinationSlug) {
      queryParams['location'] = this.selectedDestinationSlug;
    }

    // Add category filter (slug)
    if (this.selectedTripType !== null) {
      const category = this.allCategories.find((cat) => cat.id === this.selectedTripType);
      if (category && category.slug) {
        queryParams['type'] = category.slug;
      }
    }

    // Add duration filter (slug)
    if (this.selectedDurationSlug) {
      queryParams['duration'] = this.selectedDurationSlug;
    }

    // Add price range params
    if (this.minBudget > 0) {
      queryParams['minPrice'] = this.minBudget;
    }

    if (this.maxBudget < 5000) {
      queryParams['maxPrice'] = this.maxBudget;
    }

    // Update URL without reloading the page
    this._Router.navigate([], {
      relativeTo: this._ActivatedRoute,
      queryParams: queryParams,
      queryParamsHandling: '', // Replace all params
      replaceUrl: true, // Don't add to history
    });
  }

  // Handle pagination page change
  onPageChange(page: number): void {
    // Fetch tours for the new page with current filters
    this.getAllTours(page);
  }

  // sort
  onSortChange(event: Event) {
    const sortBy = (event.target as HTMLSelectElement).value;

    switch (sortBy) {
      case 'recent':
        this.sortByRecent();
        break;
      // to do best seller , you must have property to check number of seller si 'sales_count'
      // i use display_order [true or false]
      case 'bestseller':
        this.sortByBestSeller();
        break;
      case 'price-low-high':
        this.sortByPriceAsc();
        break;
      case 'price-high-low':
        this.sortByPriceDesc();
        break;
      default:
        break;
    }
  }

  sortByBestSeller() {
    this.filteredTours = [...this.allTours].sort((a, b) => b.display_order - a.display_order);
    // console.log(this.filteredTours);
  }

  sortByRecent() {
    this.filteredTours = [...this.allTours].sort((a, b) => b.id - a.id);
    // console.log(this.filteredTours);
  }

  sortByPriceAsc() {
    this.filteredTours = [...this.allTours].sort((a, b) => a.start_from - b.start_from);
    // console.log(this.filteredTours);
  }

  sortByPriceDesc() {
    this.filteredTours = [...this.allTours].sort((a, b) => b.start_from - a.start_from);
    // console.log(this.filteredTours);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  toggleFilterSection(section: string) {
    // If clicking the same section, close it; otherwise open the clicked section
    if (this.openFilterSection === section) {
      this.openFilterSection = '';
    } else {
      this.openFilterSection = section;
    }
  }

  isFilterSectionOpen(section: string): boolean {
    return this.openFilterSection === section;
  }
}
