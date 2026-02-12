import { Component, ChangeDetectorRef } from '@angular/core';
import { MakeTripFormComponent } from '../../shared/components/make-trip-form/make-trip-form.component';
import { Parteners } from '../../shared/components/parteners/parteners.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { DataService } from '../../services/data.service';
import { SeoService } from '../../services/seo.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    MakeTripFormComponent,
    Parteners,
    ReactiveFormsModule,
    CommonModule,
    BannerComponent,
    TranslateModule,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  constructor(
    private _DataService: DataService,
    private toaster: ToastrService,
    private _SeoService: SeoService,
    private cdr: ChangeDetectorRef
  ) {}

  bannerTitle: string = 'contact';
  backgroundImage = '/assets/image/banner.webp';

  countryList: any[] = [];
  phoneNumber: string | string[] = '';
  userEmail: string = '';
  userAddress: string = '';
  userLocation: string = '';

  // Helper methods for template
  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  getFirstPhoneNumber(): string {
    if (Array.isArray(this.phoneNumber) && this.phoneNumber.length > 0) {
      return this.phoneNumber[0];
    }
    return typeof this.phoneNumber === 'string' ? this.phoneNumber : '';
  }

  getPhoneDisplay(): string {
    if (Array.isArray(this.phoneNumber)) {
      return this.phoneNumber.join(', ');
    }
    return this.phoneNumber || '';
  }

  ngOnInit(): void {
    this._SeoService.updateSeoData(
      {},
      'scrappe voyager - Contact',
      "Get in touch with scrappe voyager. Contact us for bookings, inquiries, or travel assistance. We're here to help you plan your perfect trip.",
      '/assets/image/scrappe-voyager-logo.webp'
    );
    this.getCountries();
    this.getSettings();
  }

  contactForm: FormGroup = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    phone: new FormControl(''),
    country: new FormControl(''),
    subject: new FormControl(''),
    message: new FormControl(''),
  });

  getContactData(): void {
    // console.log(this.contactForm.value);

    this._DataService.sendContactData(this.contactForm.value).subscribe({
      next: (response) => {
        // console.log(response);
        this.toaster.success(response.message);
      },
      error: (err) => {
        // console.log(err.error);
        this.toaster.error(err.error.message);
      },
    });
    this.contactForm.reset();
  }

  // Helper method to extract value from option_value (handles both array and string)
  private extractOptionValue(item: any): string {
    if (!item || !item.option_value) {
      return '';
    }
    // If option_value is an array, take the first element or join them
    if (Array.isArray(item.option_value)) {
      return item.option_value.length > 0 ? item.option_value[0] : '';
    }
    // If it's a string, return as is
    return item.option_value;
  }

  getSettings(): void {
    this._DataService.getSetting().subscribe({
      next: (response) => {
        setTimeout(() => {
          const phoneItem = response.data.find(
            (item: any) => item.option_key === 'CONTACT_PHONE_NUMBER'
          );
          const emailItem = response.data.find((item: any) => item.option_key === 'email_address');
          const addressItem = response.data.find((item: any) => item.option_key === 'address');
          const locationItem = response.data.find(
            (item: any) => item.option_key === 'company_location_url'
          );

          // Extract values handling arrays
          if (phoneItem) {
            // For phone, keep as array if it's an array, otherwise convert to string
            if (Array.isArray(phoneItem.option_value)) {
              this.phoneNumber = phoneItem.option_value;
            } else {
              this.phoneNumber = phoneItem.option_value || '';
            }
          }

          this.userEmail = emailItem ? this.extractOptionValue(emailItem) : '';
          this.userAddress = addressItem ? this.extractOptionValue(addressItem) : '';
          this.userLocation = locationItem ? this.extractOptionValue(locationItem) : '';

          this.cdr.markForCheck();
        }, 0);
      },
    });
  }

  getCountries(): void {
    this._DataService.getCountries().subscribe({
      next: (response) => {
        setTimeout(() => {
          this.countryList = response.data;
          this.cdr.markForCheck();
        }, 0);
      },
    });
  }
}
