import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SocialComponent } from '../social/social.component';
import { DataService } from '../../../services/data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [SocialComponent, RouterLink, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements OnInit {
  constructor(private dataService: DataService, private cdr: ChangeDetectorRef) {}
  settings: any;

  logo: string = '';
  title: string = '';
  address: string = '';
  phone: string = '';
  email: string = '';
  socialLinks: any[] = [];

  ngOnInit(): void {
    // Always use getSetting() which handles cache and API calls
    this.dataService.getSetting().subscribe((res) => {
      // Handle both response formats: { data: [...] } or [...]
      this.settings = res?.data || res;

      // Only process settings if they exist and are an array
      if (this.settings && Array.isArray(this.settings)) {
        // Use setTimeout to defer the update to the next change detection cycle
        setTimeout(() => {
          this.processSettings();
          this.cdr.markForCheck();
        }, 0);
      }
    });
  }

  private processSettings(): void {
    // loop through settings and get the logo, address, phone, email, social links
    // if found option_key is logo , address, CONTACT_PHONE_NUMBER, email_address, social_links
    if (!this.settings || !Array.isArray(this.settings)) {
      return;
    }

    this.settings.forEach((item: any) => {
      if (item.option_key === 'logo') {
        // Handle both string and array formats
        this.logo = Array.isArray(item.option_value)
          ? item.option_value[0] || ''
          : item.option_value || '';
      }
      this.logo= '../../../../assets/white_logo.webp'
      if (item.option_key === 'address') {
        this.address = Array.isArray(item.option_value)
          ? item.option_value[0] || ''
          : item.option_value || '';
      }
      if (item.option_key === 'CONTACT_PHONE_NUMBER') {
        // Handle both string and array formats - take first phone if array
        const phoneValue = Array.isArray(item.option_value)
          ? item.option_value[0] || ''
          : item.option_value || '';
        // Remove any non-digit characters except + at the start
        this.phone = phoneValue
          .toString()
          .replace(/[^\d+]/g, '')
          .replace(/^\+?/, '');
      }
      if (item.option_key === 'email_address') {
        this.email = Array.isArray(item.option_value)
          ? item.option_value[0] || ''
          : item.option_value || '';
      }
      if (item.option_key === 'social_links') {
        this.socialLinks = (item.option_value || []).map((link: any, index: number) => ({
          ...link,
          id: link.id || link.url || `social-${index}`, // إضافة id فريد
        }));
      }
      if (item.option_key === 'site_title') {
        this.title = Array.isArray(item.option_value)
          ? item.option_value[0] || ''
          : item.option_value || '';
      }
    });
  }
}
