import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-faq-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-content.component.html',
  styleUrl: './faq-content.component.scss',
})
export class FaqContent implements OnInit {
  faqs: any[] = [];
  openIndex: number | null = null;
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);
  private _DataService = inject(DataService);

  ngOnInit(): void {
    this.loadFaqs();
  }

  loadFaqs(): void {
    this._DataService.getFaqs().subscribe({
      next: (res) => {
        if (res && res.data && res.data.data && Array.isArray(res.data.data)) {
          this.faqs = res.data.data.map((faq: any) => ({
            ...faq,
            safeAnswer: faq.answer
              ? this.sanitizer.bypassSecurityTrustHtml(faq.answer)
              : this.sanitizer.bypassSecurityTrustHtml(''),
          }));
          console.log('faqs loaded:', this.faqs);
        } else {
          console.warn('Invalid FAQ data structure:', res);
          this.faqs = [];
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading FAQs:', err);
        this.faqs = [];
        this.cdr.markForCheck();
      },
    });
  }

  toggleFaq(index: number): void {
    if (this.openIndex === index) {
      this.openIndex = null;
    } else {
      this.openIndex = index;
    }
  }

  isOpen(index: number): boolean {
    return this.openIndex !== null && this.openIndex === index;
  }
}
