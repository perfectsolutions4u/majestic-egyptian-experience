import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SeoService } from '../../services/seo.service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, TranslateModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  constructor(
    private _DataService: DataService,
    private _AuthService: AuthService,
    private toastr: ToastrService,
    private _Router: Router,
    private seoService: SeoService
  ) {}

  bannerTitle = 'login';
  logo!: any;
  siteTitle!: any;
  isLoading = false;
  countryList: any[] = [];

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.seoService.updateSeoData(
      {},
      'Majestic Tours - Login',
      'Login to your majestic Tours account to access your bookings, profile, and exclusive travel offers.',
      '../../../assets/goFly logo.svg'
    );
    // this.getSettings();
    // this.getCountries();
  }

  handleLoginForm(): void {
    if (this.loginForm.valid) {
      // console.log(this.loginForm.value);
      this.isLoading = true;
      this._AuthService.setlogin(this.loginForm.value).subscribe({
        next: (response) => {
          if (response.status === true) {
            // console.log(response);

            // حفظ الـ token
            this._AuthService.saveToken(response.data.accessToken);

            this.toastr.success(response.message);

            this._Router.navigate(['']);
          } else {
            this.toastr.error('Login failed');
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.toastr.error(err?.error?.message ?? 'Login error');
          this.isLoading = false;
        },
      });
    }
  }

  handleForgetPass(email: any): void {
    // console.log(email);
    this._AuthService.setForgetPass(email).subscribe({
      next: (res) => {
        // console.log(res);
        this.toastr.success(res.message);
      },
    });
  }
}
