import { Component, Inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './shared/components/nav/nav.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { WhatsappIconComponent } from './shared/components/whatsapp-icon/whatsapp-icon.component';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, NavComponent, FooterComponent, NgxSpinnerModule, WhatsappIconComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('majestic');
  protected readonly isBrowserValue: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private translate: TranslateService
  ) {
    // Set browser flag immediately in constructor to avoid change detection issues
    this.isBrowserValue = isPlatformBrowser(this.platformId);
  }

  protected isBrowser(): boolean {
    return this.isBrowserValue;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const langCode = localStorage.getItem('language') || 'en';

      // Apply lang and dir to <html>
      const htmlTag = document.documentElement;
      htmlTag.setAttribute('lang', langCode);
      htmlTag.setAttribute('dir', 'ltr'); // Both English and Spanish are LTR

      // Listen for language changes
      this.translate.onLangChange.subscribe((event) => {
        const currentLang = event.lang;
        htmlTag.setAttribute('lang', currentLang);
        htmlTag.setAttribute('dir', 'ltr'); // Both English and Spanish are LTR
      });
    } else {
      this.translate.use('en');
    }
  }
}
