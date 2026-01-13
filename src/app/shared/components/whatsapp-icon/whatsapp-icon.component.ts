import { Component, OnInit, OnDestroy, ChangeDetectorRef, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-whatsapp-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-icon.component.html',
  styleUrl: './whatsapp-icon.component.scss',
})
export class WhatsappIconComponent implements OnInit, OnDestroy {
  phoneNumbers: string[] = [];
  showPhoneList: boolean = false;
  selectedPhone: string = '';

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.getPhoneNumbers();
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const container = document.querySelector('.whatsapp-container');
    
    if (container && !container.contains(target) && this.showPhoneList) {
      this.closePhoneList();
    }
  }

  getPhoneNumbers(): void {
    this.dataService.getSetting().subscribe({
      next: (response) => {
        if (response?.data) {
          const phoneItem = response.data.find(
            (item: any) => item.option_key === 'CONTACT_PHONE_NUMBER'
          );

          if (phoneItem) {
            if (Array.isArray(phoneItem.option_value)) {
              this.phoneNumbers = phoneItem.option_value.filter(
                (phone: string) => phone && phone.trim() !== ''
              );
            } else if (phoneItem.option_value) {
              this.phoneNumbers = [phoneItem.option_value];
            }

            // Set default selected phone (first one)
            if (this.phoneNumbers.length > 0) {
              this.selectedPhone = this.phoneNumbers[0];
            }
          }
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.warn('Failed to load phone numbers:', err);
      },
    });
  }

  togglePhoneList(): void {
    if (this.phoneNumbers.length > 1) {
      this.showPhoneList = !this.showPhoneList;
    } else if (this.phoneNumbers.length === 1) {
      this.openWhatsApp(this.phoneNumbers[0]);
    }
  }

  selectPhone(phone: string): void {
    this.selectedPhone = phone;
    this.showPhoneList = false;
    this.openWhatsApp(phone);
  }

  openWhatsApp(phone: string): void {
    if (!phone) return;

    // Clean phone number - remove any non-digit characters except +
    const cleanPhone = phone.toString().replace(/[^\d+]/g, '').replace(/^\+?/, '');

    // WhatsApp URL format: https://wa.me/PHONENUMBER
    const whatsappUrl = `https://wa.me/${cleanPhone}`;

    if (isPlatformBrowser(this.platformId)) {
      window.open(whatsappUrl, '_blank');
    }
  }

  closePhoneList(): void {
    this.showPhoneList = false;
  }
}
