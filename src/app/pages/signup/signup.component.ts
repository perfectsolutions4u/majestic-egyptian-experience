import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { DataService } from '../../services/data.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, TranslateModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnInit {
  constructor(
    private _DataService: DataService,
    private _AuthService: AuthService,
    private toastr: ToastrService,
    private _Router: Router,
    private seoService: SeoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  bannerTitle = 'sign up';
  logo!: any;
  siteTitle!: any;
  isLoading = false;
  countryList: any[] = [];

  registerForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    password_confirmation: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required]),
    birthdate: new FormControl('', [Validators.required]),
    nationality: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.seoService.updateSeoData(
      {},
      'Majestic Tours - Sign Up',
      'Create your Majestic Tours account to access exclusive travel deals, manage bookings, and enjoy premium travel experiences.',
      '../../../assets/goFly logo.svg'
    );

    // Only make API calls in browser to avoid SSR timeout issues
    if (isPlatformBrowser(this.platformId)) {
      this.getSettings();
      this.getCountries();
    }
  }
  getSettings(): void {
    this._DataService.getSetting().subscribe({
      next: (res) => {
        if (res?.data) {
          const contactLogo = res.data.find((item: any) => item.option_key === 'logo');
          this.logo = contactLogo?.option_value[0];

          const title = res.data.find((item: any) => item.option_key === 'site_title');
          this.siteTitle = title?.option_value[0];
        }
      },
      error: (err) => {
        // Silently handle error - API might be unavailable during SSR
        console.warn('Failed to load settings:', err);
      },
    });
  }

  getCountries() {
    this._DataService.getCountries().subscribe({
      next: (response) => {
        if (response?.data) {
          this.countryList = response.data;
        }
      },
      error: (err) => {
        // Silently handle error - API might be unavailable during SSR or network issues
        console.warn('Failed to load countries:', err);
        // Set empty array as fallback
        this.countryList = [];
      },
    });
  }

  handleRegisterForm(): void {
    if (this.registerForm.valid) {
      // console.log(this.registerForm.value);
      this.isLoading = true;
      this._AuthService.setRegister(this.registerForm.value).subscribe({
        next: (response) => {
          // console.log(response);
          if (response.status == true) {
            // console.log('true');
            this.isLoading = false;
            this.toastr.success(response.message);

            // navigate to login
            this._Router.navigate(['/login']);
          }
        },
        error: (err) => {
          // console.log(err);
          this.isLoading = false;
          this.toastr.error(err.error.message);
        },
      });
    } else {
      this.toastr.error('Your Data is Not valid');
    }
  }
}
