import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IBlog } from '../../../core/interfaces/iblog';
import { DatePipe } from '@angular/common';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-blog-cart',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './blog-cart.component.html',
  styleUrl: './blog-cart.component.scss',
})
export class BlogCartComponent {
  @Input() blog?: IBlog;
  constructor(private domSanitizer: DomSanitizer) {}
  sanitizeHtml(html: string): SafeHtml {
    if (!html) {
      return this.domSanitizer.bypassSecurityTrustHtml('No description available');
    }
    return this.domSanitizer.bypassSecurityTrustHtml(html);
  }
}
