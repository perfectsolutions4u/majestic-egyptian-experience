import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { SeoService } from '../../services/seo.service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, CommonModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss',
})
export class ForgetPasswordComponent {
  constructor(
    private _AuthService: AuthService,
    private toastr: ToastrService,
    private seoService: SeoService,
    private _Router: Router
  ) {}

  forgetPasswordForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required]),
    otp: new FormControl('', [Validators.required]),
  });

  bannerTitle = 'forget password';
  logo!: any;
  siteTitle!: any;
  isLoading = false;
  countryList: any[] = [];

  ngOnInit(): void {
    this.seoService.updateSeoData(
      {},
      'Majestic Tours - Forget Password',
      'Reset your Alfa Omega Tours account password. Recover access to your travel account securely.',
      '../../../assets/goFly logo.svg'
    );
    // this.getSettings();
    // this.getCountries();
  }

  handleForgetPassForm(): void {
    if (this.forgetPasswordForm.valid) {
      this.isLoading = true;
      this._AuthService.setOTP(this.forgetPasswordForm.value).subscribe({
        next: (response) => {
          if (response.status == true) {
            // console.log(response);
            this.isLoading = false;
            this.toastr.success(response.message);
            this._Router.navigate(['/login']);
          }
        },
        error: (err) => {
          console.error(err);
          this.toastr.error(err.error.message, 'Enter the correct otp code');
        },
      });
    }
  }
}
