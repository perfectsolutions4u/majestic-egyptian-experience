import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-whatsapp-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-icon.component.html',
  styleUrl: './whatsapp-icon.component.scss',
})
export class WhatsappIconComponent {
  whatsappNumber: string = '+2011226600995'; // Default WhatsApp number
  whatsappMessage: string = 'Hello! I would like to know more about your services.';

  getWhatsAppUrl(): string {
    const encodedMessage = encodeURIComponent(this.whatsappMessage);
    return `https://wa.me/${this.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
  }
}
