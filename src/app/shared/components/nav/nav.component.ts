import {
  Component,
  signal,
  OnInit,
  Inject,
  PLATFORM_ID,
  OnDestroy,
  computed,
  ChangeDetectorRef,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from '../../../services/data.service';
import { Subject, takeUntil, tap } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent implements OnInit, OnDestroy {
  private $destory = new Subject<void>();

  allDestinations: any[] = [];
  allCategories: any[] = [];

  showSettings = signal(false);
  showTours = signal(false);
  showDestinations = signal(false);
  showLanguage = signal(false);
  sidebarOpen = signal(false);
  mobileSearchOpen = signal(false);
  selectedLanguage = signal('en');
  expandedSubmenus = signal({
    destinations: false,
    tours: false,
  });

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
        const title = res.data.find((item: any) => item.option_key === 'site_title');
        this.title = title?.option_value[0] || '';
        console.log('nav page -- logo -- ', this.logo);
        console.log('nav page -- title -- ', this.title);
        this.cdr.markForCheck();
      }, 0);
    });
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
    } else {
      this.translate.use('en');
    }
  }

  toggleMobileSearch(): void {
    this.mobileSearchOpen.update((val) => !val);
  }

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

  ngOnDestroy(): void {
    this.$destory.next();
    this.$destory.complete();
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
            this.allDestinations = destinations;
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
}
