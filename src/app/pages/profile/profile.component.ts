import { Component, signal, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ProfileService } from '../../services/profile.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { SeoService } from '../../services/seo.service';
import { BookingService } from '../../services/booking.service';
// Import ngx-dropzone-next components
// Using wrapper components to work around Angular 20 static analysis issue
import {
  NgxDropzoneComponent,
  NgxDropzoneLabelDirective,
  NgxDropzoneImagePreviewComponent,
} from '../../shared/components/ngx-dropzone-wrapper/ngx-dropzone-wrapper.component';
// Also import the actual components to ensure they're available at runtime
// This import is needed even though it causes static analysis warnings
import 'ngx-dropzone-next';
import { CommonModule } from '@angular/common';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { TourCartComponent } from '../../shared/components/tour-cart/tour-cart.component';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    NgxDropzoneComponent,
    NgxDropzoneLabelDirective,
    NgxDropzoneImagePreviewComponent,
    CommonModule,
    ReactiveFormsModule,
    CarouselModule,
    TourCartComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('slideInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
    trigger('tabContent', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
          ],
          { optional: true }
        ),
        query(
          ':leave',
          [animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))],
          { optional: true }
        ),
      ]),
    ]),
    trigger('staggerCards', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(100, [
              animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('menuItem', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('staggerMenu', [
      transition(':enter', [
        query(
          'li',
          [
            style({ opacity: 0, transform: 'translateX(-20px)' }),
            stagger(50, [
              animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  constructor(
    private _DataService: DataService,
    private _BookingService: BookingService,
    private _ProfileService: ProfileService,
    private _AuthService: AuthService,
    private _Router: Router,
    private toaster: ToastrService,
    private seoService: SeoService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  bannerTitle: string = 'my profile';
  updateProfile!: FormGroup;
  updateImage!: FormGroup;
  countriesList: any[] = [];
  tourCart: any[] = [];
  favList: any[] = [];
  haveData: boolean = false;
  profilemeData: any = {};

  files = signal<File[]>([]);

  selectedTab: string = 'dashboard';

  ngOnInit(): void {
    this.seoService.updateSeoData(
      {},
      'scrappe voyager - My Account',
      'Manage your profile, bookings, and preferences with scrappe voyager. Access your account dashboard.',
      '../../../assets/image/scrappe-voyager-logo.webp'
    );

    // Check if we're in browser environment (for SSR compatibility)
    if (!isPlatformBrowser(this.platformId)) {
      return; // Skip token check on server side
    }

    // Check token using isLoggedIn() method which properly handles browser check
    const token = this._AuthService.getToken();
    const isLoggedIn = this._AuthService.isLoggedIn();

    console.log('Token check:', {
      token,
      isLoggedIn,
      hasToken: !!token,
      localStorageToken: localStorage.getItem('accessToken'),
    });

    if (token && isLoggedIn) {
      this.showCountries();
      this.profileMe();
      this.updateProfile = new FormGroup({
        name: new FormControl(''),
        password: new FormControl(''),
        password_confirmation: new FormControl(''),
        phone: new FormControl(''),
        // email: new FormControl(''),
        nationality: new FormControl(''),
      });
      this.updateImage = new FormGroup({
        image: new FormControl(''),
      });

      this.getListCart();
      this.getFav();
    } else {
      this._Router.navigate(['/login']);
      this.toaster.warning('Please Login First');
    }
  }

  // عند الاختيار
  onSelect(evt: any) {
    const added: File[] = evt?.addedFiles ?? [];
    if (!added.length) return;

    // const file = added[0]; // صورة واحدة فقط
    // اعرض بريفيه محلي للملف بينما بنرفع (لو حابب تفضل تعرض المخزنة سيب السطر ده)
    this.profilemeData.image = null; // عشان يبان الـ preview من dropzone
    this.files.set([added[0]]);
    this.uploadImage(added[0]);
    // this.files.set([file]);

    // this.uploadImage(file);
  }

  onRemove(file: File) {
    this.files.set([]);
  }

  uploadImage(file: File): void {
    const userImage = new FormData();
    userImage.append('image', file);

    this._ProfileService.updateImageProfile(userImage).subscribe({
      next: (res) => {
        // console.log('Uploaded ✅', res);
        // حاول تجيب الـ URL من الاستجابة
        const serverUrl = res?.data?.image || res?.image || res?.url || null;
        if (serverUrl) {
          // حدّث الصورة المخزنة واعمل كسر كاش
          this.profilemeData.image = this.cacheBust(serverUrl);
          // نظّف ملفات الـ preview
          this.files.set([]);
        }
        this.toaster.success('Profile image updated');
      },
      error: (err) => {
        console.error('Upload error ❌', err);
        this.toaster.error(err?.error?.message || 'Upload failed');
        // في حالة فشل الرفع رجّع البريفيو كما كان
        this.files.set([]);
        this.profileMe(); // رجّع صورة السيرفر (لو كانت موجودة)
      },
    });
  }

  // إضافة query param لكسر الكاش
  private cacheBust(url: string): string {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}_ts=${Date.now()}`;
  }

  getListCart(): void {
    this._BookingService.getCartList().subscribe({
      next: (response: any) => {
        setTimeout(() => {
          this.tourCart = response.data;
          if (this.tourCart.length === 0) {
            this.haveData = false;
            // // console.log(this.tourCart);
          } else {
            this.tourCart = response.data.map((tour: any) => ({
              ...tour,
              totalPrice:
                tour.adults * tour.tour.adult_price +
                tour.children * tour.tour.child_price +
                tour.infants * tour.tour.infant_price,
            }));
            this.haveData = true;
            // console.log(this.tourCart);
          }
          this.cdr.markForCheck();
        }, 0);
      },
      error: (err: any) => {
        // console.log(err);
      },
    });
  }

  showCountries(): void {
    const cachedCountries = this._DataService.getFromLocalStorage('majestic_countries');
    if (cachedCountries && cachedCountries.data) {
      setTimeout(() => {
        this.countriesList = cachedCountries.data;
        console.log('make trip page -- countries (from cache) -- ', this.countriesList);
        this.cdr.markForCheck();
      }, 0);
      return;
    } else {
      this._BookingService.getCountries().subscribe({
        next: (response: any) => {
          setTimeout(() => {
            // console.log(response.data);
            this.countriesList = response.data;
            this.cdr.markForCheck();
          }, 0);
        },
      });
    }
  }

  submitProfileData(): void {
    if (this.updateProfile.valid) {
      const profileData = this.updateProfile.value;
      // console.log(profileData);
      this._ProfileService.updateProfile(profileData).subscribe({
        next: (response) => {
          // console.log(response);
          this.toaster.success(response.error.message);
        },
        error: (err) => {
          // console.log(err);
          this.toaster.error(err.error.message);
        },
      });
    } else {
      // console.log('nooooo');
    }
  }

  profileMe(): void {
    this._ProfileService.getProfile().subscribe({
      next: (response) => {
        setTimeout(() => {
          this.profilemeData = response.data;
          const url = response?.data?.image;
          this.profilemeData.image = url ? this.cacheBust(url) : null;
          // مفيش ملفات مختارة حالياً
          this.files.set([]);
          this.cdr.markForCheck();
          // // console.log(this.profilemeData.image);
        }, 0);
      },
      error: (err) => {
        // console.log(err);
        // // console.log(localStorage.getItem('accessToken'));
      },
    });
  }

  logout(): void {
    this._ProfileService.logoutProfile().subscribe({
      next: (response) => {
        // // console.log(response);
        localStorage.removeItem('accessToken');
        // navigate it to home
        this._Router.navigate(['']);
        // // console.log('ahmed');
        this.toaster.success(response.message);
      },
      error: (err) => {
        // // console.log(err);
        this.toaster.error(err.error.message);
      },
    });
  }

  getFav(): void {
    this._DataService.getWishlist().subscribe({
      next: (response) => {
        if (localStorage.getItem('accessToken')) {
          setTimeout(() => {
            this.favList = response.data.data;
            // console.log(response.data.data);
            if (this.favList.length === 0) {
              this.haveData = false;
            // // console.log(this.favList.length);
            } else {
              this.haveData = true;
              // console.log(response.data.data);
              this.favList = response.data.data;
            }
            this.cdr.markForCheck();
          }, 0);
        }
      },
      error: (err) => {
        // this.toaster.error(err.error.message, 'you must login first');
      },
    });
  }

  bookingOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    autoplay: true,
    dots: true,
    smartSpeed: 1500,
    margin: 10,
    responsive: {
      0: { items: 1 },
      586: { items: 2 },
    },
    nav: false,
  };
}
