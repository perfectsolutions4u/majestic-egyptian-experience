import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject, takeUntil, tap } from 'rxjs';
import { DataService } from '../../services/data.service';
import { Router, RouterLink } from '@angular/router';
import { MakeTripService } from '../../services/make-trip.service';
import { SeoService } from '../../services/seo.service';
import { DatepickerService } from '../../services/datepicker.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioChange } from '@angular/material/radio';
import { TourCartComponent } from '../../shared/components/tour-cart/tour-cart.component';
import { Itour } from '../../core/interfaces/itour';
import { IDestination } from '../../core/interfaces/idestination';
import { ICategory } from '../../core/interfaces/icategory';
import { IDuration } from '../../core/interfaces/iduration';
import { DestinationCartComponent } from '../../shared/components/destination-cart/destination-cart.component';
import { IBlog } from '../../core/interfaces/iblog';
import { BlogCartComponent } from '../../shared/components/blog-cart/blog-cart.component';
import { BestServices } from '../../shared/components/best-services/best-services.component';
import { OwlOptions, CarouselModule } from 'ngx-owl-carousel-o';
import { MakeTripFormComponent } from '../../shared/components/make-trip-form/make-trip-form.component';
import { Parteners } from '../../shared/components/parteners/parteners.component';
import { FaqContent } from '../../shared/components/faq-content/faq-content.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    RouterLink,
    MatTabsModule,
    MatRadioModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    TourCartComponent,
    DestinationCartComponent,
    BlogCartComponent,
    BestServices,
    CarouselModule,
    MakeTripFormComponent,
    Parteners,
    FaqContent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  @ViewChild('StartDatepicker') startDatepicker!: MatDatepicker<Date>;
  @ViewChild('EndDatepicker') endDatepicker!: MatDatepicker<Date>;

  private $destory = new Subject<void>();
  isBrowser: boolean;
  sanitizedVideoUrl: SafeResourceUrl;
  rawVideoUrl = 'https://gofly-wp.egenstheme.com/wp-content/uploads/2025/09/home1-banner-video.mp4';

  constructor(
    private _DataService: DataService,
    private _Router: Router,
    private _MaketripService: MakeTripService,
    private sanitizer: DomSanitizer,
    private seoService: SeoService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private el: ElementRef,
    private fb: FormBuilder,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private datepickerService: DatepickerService
  ) {
    this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawVideoUrl);
    this.isBrowser = isPlatformBrowser(platformId);
    this.initMakeTripForm();
  }

  // // Helper method to get data from localStorage
  // getFromLocalStorage(key: string): any | null {
  //   if (!this.isBrowser) {
  //     return null;
  //   }
  //   try {
  //     const item = localStorage.getItem(key);
  //     return item ? JSON.parse(item) : null;
  //   } catch (error) {
  //     console.warn(`Error reading from localStorage for key ${key}:`, error);
  //     return null;
  //   }
  // }

  MarkTime: string = 'exact';
  monthList: string[] = [];
  monthKeys = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ];
  popularTours: Itour[] = [];
  allDestinations: IDestination[] = [];
  allCategories: ICategory[] = [];
  allDurations: IDuration[] = [];
  allBlogs: IBlog[] = [];
  tourSearchForm!: FormGroup;
  makeTripForm!: FormGroup;
  featuredCategories: ICategory[] = [];

  ngOnInit(): void {
    this.getPopularTours();
    // Get settings and update SEO from API, with fallback to defaults
    this.getSettingsAndUpdateSeo();
    this.getDestination();
    this.getCategory();
    this.getDurations();
    this.getBlogs();

    this.tourSearchForm = this.fb.group({
      location: ['', Validators.required],
      type: ['', Validators.required],
      duration: [''],
    });

    // Subscribe to form value changes to update display
    this.tourSearchForm.valueChanges.subscribe(() => {
      this.cdr.markForCheck();
    });

    this.makeTripForm.valueChanges.subscribe(() => {
      this.cdr.markForCheck();
    });

    // Load translated months
    this.loadMonths();

    // Reload months when language changes
    this.translate.onLangChange.subscribe(() => {
      this.loadMonths();
      this.cdr.markForCheck();
    });
  }

  loadMonths(): void {
    this.monthList = this.monthKeys.map((key) => this.translate.instant(`home.months.${key}`));
  }

  getSettingsAndUpdateSeo(): void {
    this._DataService.getSetting().subscribe({
      next: (res) => {
        if (res.data && Array.isArray(res.data)) {
          // Get current language or default to 'en'
          const currentLang = isPlatformBrowser(this.platformId)
            ? localStorage.getItem('language') || 'en'
            : 'en';
          // console.log(res.data);

          // Extract SEO data from settings
          const seoData = this.seoService.extractSeoFromSettings(res.data, currentLang);

          // Always add "test" to title in home page
          const baseTitle = seoData.meta_title || seoData.og_title || 'Majestic Travel - Home';
          const titleWithTest = ` ${baseTitle}`;

          // Update SEO with test in title
          this.seoService.updateSeoData(
            { ...seoData, meta_title: titleWithTest, og_title: titleWithTest },
            titleWithTest,
            seoData.meta_description ||
              seoData.og_description ||
              'Discover amazing tours and travel experiences with Majestic Travel. Book your dream vacation today.',
            seoData.og_image || '../../../assets/image/banner.webp'
          );
        } else {
          // If settings API fails, use defaults with test
          this.seoService.updateSeoData(
            {
              meta_title: 'Majestic Travel - Home',
              og_title: 'Majestic Travel - Home',
            },
            'Majestic Travel - Home',
            'Discover amazing tours and travel experiences with Majestic Travel. Book your dream vacation today.',
            '../../../assets/image/banner.webp'
          );
        }
      },
      error: (err) => {
        // If settings API fails, use defaults with test
        this.seoService.updateSeoData(
          {
            meta_title: 'Majestic Travel - Home',
            og_title: 'Majestic Travel - Home',
          },
          'Majestic Travel - Home',
          'Discover amazing tours and travel experiences with Majestic Travel. Book your dream vacation today.',
          '../../../assets/image/banner.webp'
        );
      },
    });
  }

  initMakeTripForm(): void {
    this.makeTripForm = this.fb.group({
      city: ['', Validators.required],
      start_date: [''],
      end_date: [''],
      approximate_time: [''],
    });
  }

  onTourSubmit() {
    const formData = {
      ...this.tourSearchForm.value,
    };

    // navigate to tour List
    this._Router.navigate(['/tour'], {
      queryParams: formData,
    });
  }

  onMakeTripSubmit() {
    if (this.makeTripForm.invalid) return;

    // console.log('fire done onMakeTripSubmit');
    // console.log(this.makeTripForm.value);

    const formValue = this.makeTripForm.value;

    this._MaketripService.setMakeTripSteps({
      destination: formValue.city || undefined,
      fromDuration: formValue.start_date || null,
      ToDuration: formValue.end_date || null,
      appro: formValue.approximate_time || null,
    });

    this._Router.navigate(['/makeTrip']);
  }

  onChangeTime(event: MatRadioChange): void {
    this.MarkTime = event.value;
  }

  // Open date picker when clicking on date input
  openStartDatePicker() {
    this.datepickerService.openDatePicker(this.startDatepicker);
  }

  openEndDatePicker() {
    this.datepickerService.openDatePicker(this.endDatepicker);
  }

  // Helper methods to get display values
  getSelectedDestination(): string {
    const location = this.tourSearchForm?.get('location')?.value;
    if (!location) return '';
    const destination = this.allDestinations.find((d) => d.slug === location);
    return destination?.title || '';
  }

  getSelectedCategory(): string {
    const type = this.tourSearchForm?.get('type')?.value;
    if (!type) return '';
    const category = this.allCategories.find((c) => c.slug === type);
    return category?.title || '';
  }

  getSelectedDuration(): string {
    const duration = this.tourSearchForm?.get('duration')?.value;
    if (!duration) return '';
    const durationObj = this.allDurations.find((d) => d.slug === duration);
    return durationObj?.title || '';
  }

  getSelectedCity(): string {
    const city = this.makeTripForm?.get('city')?.value;
    if (!city) return '';
    const destination = this.allDestinations.find((d) => d.slug === city);
    return destination?.title || '';
  }

  getFormattedStartDate(): string {
    const date = this.makeTripForm?.get('start_date')?.value;
    if (!date) return '';

    // Handle both Date objects and string dates
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '';

    try {
      const day = dateObj.getDate();
      const month = dateObj.toLocaleDateString(this.translate.currentLang || 'en', { month: 'long' });
      return `${day} ${month}`;
    } catch {
      return '';
    }
  }

  getFormattedStartDateLabel(): string {
    const date = this.makeTripForm?.get('start_date')?.value;
    if (!date) return '';

    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '';

    try {
      const weekday = dateObj.toLocaleDateString(this.translate.currentLang || 'en', { weekday: 'long' });
      const year = dateObj.getFullYear();
      return `${weekday} ${year}`;
    } catch {
      return '';
    }
  }

  getFormattedEndDate(): string {
    const date = this.makeTripForm?.get('end_date')?.value;
    if (!date) return '';

    // Handle both Date objects and string dates
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '';

    try {
      const day = dateObj.getDate();
      const month = dateObj.toLocaleDateString(this.translate.currentLang || 'en', { month: 'long' });
      return `${day} ${month}`;
    } catch {
      return '';
    }
  }

  getFormattedEndDateLabel(): string {
    const date = this.makeTripForm?.get('end_date')?.value;
    if (!date) return '';

    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '';

    try {
      const weekday = dateObj.toLocaleDateString(this.translate.currentLang || 'en', { weekday: 'long' });
      const year = dateObj.getFullYear();
      return `${weekday} ${year}`;
    } catch {
      return '';
    }
  }

  getSelectedMonth(): string {
    const monthIndex = this.makeTripForm?.get('approximate_time')?.value;
    if (!monthIndex || monthIndex < 1 || monthIndex > 12) return '';
    return this.monthList[monthIndex - 1] || '';
  }

  getPopularTours() {
    this._DataService
      .getTours()
      .pipe(takeUntil(this.$destory))
      .subscribe({
        next: (res) => {
          // Handle both response formats: { data: { data: [...] } } or { data: [...] }
          const tours = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
          if (Array.isArray(tours) && tours.length > 0) {
            setTimeout(() => {
              this.popularTours = tours;
              console.log('popular tours', this.popularTours);
              this.cdr.markForCheck();
            }, 0);
          } else {
            // Ensure it's always an array to avoid iterator errors
            this.popularTours = [];
          }
        },
        error: (err) => {
          console.error('Error loading popular tours:', err);
          this.popularTours = [];
        },
      });
  }

  ngOnDestroy(): void {
    this.$destory.next();
    this.$destory.complete();
  }

  getDestination() {
    // Use getDestination() which handles cache and API calls
    this._DataService
      .getDestination()
      .pipe(
        takeUntil(this.$destory),
        tap((res) => {
          // Handle both response formats: { data: { data: [...] } } or { data: [...] }
          const destinations = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
          if (Array.isArray(destinations) && destinations.length > 0) {
            setTimeout(() => {
              this.allDestinations = destinations.reverse();
              console.log('home page -- destinations -- ', this.allDestinations);
              this.cdr.markForCheck();
            }, 0);
          } else {
            // Ensure it's always an array to avoid iterator errors
            this.allDestinations = [];
          }
        })
      )
      .subscribe({
        error: (err) => {
          console.error('Error loading destinations:', err);
          this.allDestinations = [];
        },
      });
  }

  getCategory() {
    // Use getCategory() which handles cache and API calls
    this._DataService
      .getCategory()
      .pipe(
        takeUntil(this.$destory),
        tap((res) => {
          // Handle both response formats: { data: { data: [...] } } or { data: [...] }
          const categories = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
          if (Array.isArray(categories) && categories.length > 0) {
            setTimeout(() => {
              this.allCategories = categories;
              this.featuredCategories = categories.filter((category) => category.featured);
              console.log('home page -- categories -- ', this.allCategories);
              console.log('home page -- featured categories -- ', this.featuredCategories);
              this.cdr.markForCheck();
            }, 0);
          } else {
            // Ensure it's always an array to avoid iterator errors
            this.allCategories = [];
          }
        })
      )
      .subscribe({
        error: (err) => {
          console.error('Error loading categories:', err);
          this.allCategories = [];
        },
      });
  }

  getDurations() {
    // Use getDurations() which handles cache and API calls
    this._DataService
      .getDurations()
      .pipe(
        takeUntil(this.$destory),
        tap((res) => {
          // Handle both response formats: { data: [...] } or [...]
          const durations = res?.data || (Array.isArray(res) ? res : []);
          if (Array.isArray(durations) && durations.length > 0) {
            setTimeout(() => {
              this.allDurations = durations;
              console.log('home page -- durations -- ', this.allDurations);
              this.cdr.markForCheck();
            }, 0);
          } else {
            // Ensure it's always an array to avoid iterator errors
            this.allDurations = [];
          }
        })
      )
      .subscribe({
        error: (err) => {
          console.error('Error loading durations:', err);
          this.allDurations = [];
        },
      });
  }

  getBlogs() {
    this._DataService
      .getBlogs()
      .pipe(takeUntil(this.$destory))
      .subscribe({
        next: (res) => {
          // Handle both response formats: { data: { data: [...] } } or { data: [...] }
          const blogs = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
          if (Array.isArray(blogs) && blogs.length > 0) {
            setTimeout(() => {
              this.allBlogs = blogs;
              console.log('home page -- blogs -- ', this.allBlogs);
              this.cdr.markForCheck();
            }, 0);
          } else {
            // Ensure it's always an array to avoid iterator errors
            this.allBlogs = [];
          }
        },
        error: (err) => {
          console.error('Error loading blogs:', err);
          this.allBlogs = [];
        },
      });
  }

  destinationsOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    nav: true,
    navText: ['<i class="fa fa-chevron-left"></i>', '<i class="fa fa-chevron-right"></i>'],
    responsive: {
      0: { items: 1 },
      586: { items: 2 },
      768: { items: 3 },
      992: { items: 4 },
    },
    margin: 20,
    autoplay: true,
    smartSpeed: 2500,
  };

  popularToursOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    nav: true,
    navText: ['<i class="fa fa-chevron-left"></i>', '<i class="fa fa-chevron-right"></i>'],
    responsive: {
      0: { items: 1 },
      586: { items: 2 },
      768: { items: 3 },
      992: { items: 4 },
    },
    margin: 20,
    autoplay: true,
    smartSpeed: 2500,
  };

  featuredCategoriesOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    nav: true,
    navText: ['<i class="fa fa-chevron-left"></i>', '<i class="fa fa-chevron-right"></i>'],
    responsive: {
      0: { items: 1 },
      586: { items: 2 },
      768: { items: 3 },
      992: { items: 4 },
    },
    margin: 20,
    autoplay: true,
    smartSpeed: 2500,
  };

  blogsOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    nav: true,
    navText: ['<i class="fa fa-chevron-left"></i>', '<i class="fa fa-chevron-right"></i>'],
    responsive: {
      0: { items: 1 },
      586: { items: 2 },
      768: { items: 2 },
    },
    margin: 20,
    autoplay: true,
    smartSpeed: 2500,
  };
}
