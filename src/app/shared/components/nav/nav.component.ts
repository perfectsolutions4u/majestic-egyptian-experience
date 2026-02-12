import {
  Component,
  signal,
  OnInit,
  Inject,
  PLATFORM_ID,
  OnDestroy,
  computed,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from '../../../services/data.service';
import { Subject, takeUntil, tap, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourCartComponent } from '../tour-cart/tour-cart.component';

@Component({
  selector: 'app-nav',
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslateModule,
    CommonModule,
    FormsModule,
    TourCartComponent,
  ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent implements OnInit, OnDestroy {
  private $destory = new Subject<void>();
  private escKeyListener?: (event: KeyboardEvent) => void;
  private searchSubject = new Subject<string>();

  allDestinations: any[] = [];
  allCategories: any[] = [];

  showSettings = signal(false);
  showTours = signal(false);
  showDestinations = signal(false);
  showLanguage = signal(false);
  sidebarOpen = signal(false);
  mobileSearchOpen = signal(false);
  searchOverlayOpen = signal(false);
  selectedLanguage = signal('en');
  expandedSubmenus = signal({
    destinations: false,
    tours: false,
  });

  // Search functionality
  searchInput = signal('');
  searchResults: any[] = [];
  isSearching = signal(false);
  isScrolled = signal(false);

  constructor(
    private translate: TranslateService,
    private _DataService: DataService,
    private _AuthService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  isLoggedIn = computed(() => this._AuthService.isLoggedIn()); // computed property to check if user is logged in
  logout = () => this._AuthService.logout();
  // get logo from settings
  logo: string = '';
  title: string = '';
  getLogo(): void {
    this._DataService.getSetting().subscribe((res) => {
      setTimeout(() => {
        const logo = res.data.find((item: any) => item.option_key === 'logo');
        this.logo = logo?.option_value[0] || '';
        this.logo= '../../../../assets/main_logo.jpg'
        const title = res.data.find((item: any) => item.option_key === 'site_title');
        this.title = title?.option_value[0] || '';
        console.log('nav page -- logo -- ', this.logo);
        console.log('nav page -- title -- ', this.title);
        this.cdr.markForCheck();
      }, 0);
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled.set(window.scrollY > 0);
    }
  }

  ngOnInit(): void {
    this.getDestinations();
    this.getCategories();
    this.getLogo();
    // Load language from localStorage or use default 'en'
    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('language') || 'en';
      this.selectedLanguage.set(savedLang);
      this.translate.use(savedLang);

      // Add ESC key listener to close search overlay
      this.escKeyListener = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.searchOverlayOpen()) {
          this.closeSearchOverlay();
        }
      };
      document.addEventListener('keydown', this.escKeyListener);
    } else {
      this.translate.use('en');
    }

    // Set initial scroll state (e.g. on refresh while scrolled)
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled.set(window.scrollY > 0);
    }

    // Setup search debounce
    this.searchSubject
      .pipe(
        debounceTime(3000), // Wait 1 second after user stops typing
        distinctUntilChanged(), // Only emit if value changed
        takeUntil(this.$destory)
      )
      .subscribe((trimmed) => {
        if (trimmed.length > 0) {
          this.isSearching.set(true);
          this._DataService
            .getTours({ title: trimmed })
            .pipe(takeUntil(this.$destory))
            .subscribe({
              next: (res) => {
                const tours = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
                this.searchResults = Array.isArray(tours) ? tours : [];
                this.isSearching.set(false);
                this.cdr.markForCheck();
              },
              error: (err) => {
                console.error('Error searching tours:', err);
                this.searchResults = [];
                this.isSearching.set(false);
                this.cdr.markForCheck();
              },
            });
        } else {
          this.searchResults = [];
          this.isSearching.set(false);
        }
      });
  }

  // toggleMobileSearch(): void {
  //   this.mobileSearchOpen.update((val) => !val);
  // }

  toggleSubmenu(submenu: 'destinations' | 'tours'): void {
    this.expandedSubmenus.update((current) => ({
      ...current,
      [submenu]: !current[submenu],
    }));
  }

  selectLanguage(lang: string): void {
    this.selectedLanguage.set(lang);
    this.translate.use(lang);

    // Save to localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('language', lang);
    }

    this.showLanguage.set(false);
  }

  getCurrentLanguageCode(): string {
    return this.selectedLanguage().toUpperCase();
  }

  openSearchOverlay(): void {
    this.searchOverlayOpen.set(true);
    // Focus on search input after overlay opens
    setTimeout(() => {
      const searchInput = document.querySelector('.search-overlay-input') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  }

  closeSearchOverlay(): void {
    this.searchOverlayOpen.set(false);
    this.searchInput.set('');
    this.searchResults = [];
  }

  onSearchInputChange(value: string): void {
    this.searchInput.set(value);
    const trimmed = value.trim();

    // Clear results immediately if input is empty
    if (trimmed.length === 0) {
      this.searchResults = [];
      this.isSearching.set(false);
    }

    // Emit to subject which will debounce the API call
    this.searchSubject.next(trimmed);
  }

  ngOnDestroy(): void {
    this.$destory.next();
    this.$destory.complete();

    // Remove ESC key listener
    if (isPlatformBrowser(this.platformId) && this.escKeyListener) {
      document.removeEventListener('keydown', this.escKeyListener);
    }
  }

  getDestinations() {
    this._DataService
      .getDestination()
      .pipe(
        takeUntil(this.$destory), // close , clear suscripe memory on destroy
        tap((res) => {
          // Handle both response formats: { data: { data: [...] } } or { data: [...] }
          const destinations = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
          if (Array.isArray(destinations)) {
            this.allDestinations = destinations.reverse();
            console.log('nav page -- destinations -- ', this.allDestinations);
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

  getCategories() {
    this._DataService
      .getCategory()
      .pipe(
        takeUntil(this.$destory), // close , clear suscripe memory on destroy
        tap((res) => {
          // Handle both response formats: { data: { data: [...] } } or { data: [...] }
          const categories = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
          if (Array.isArray(categories)) {
            this.allCategories = categories;
            console.log('nav page -- categories -- ', this.allCategories);
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

  layoutType: 'grid' | 'list' = 'grid';
  setLayout(type: 'grid' | 'list') {
    this.layoutType = type;
  }
}
