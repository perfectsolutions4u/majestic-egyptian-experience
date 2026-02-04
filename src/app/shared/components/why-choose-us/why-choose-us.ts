import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-why-choose-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './why-choose-us.component.html',
  styleUrl: './why-choose-us.component.scss',
})
export class WhyChooseUs implements OnInit {
  private _DataService = inject(DataService);
  features: any[] = [];

  ngOnInit(): void {
    this.loadFeatures();
  }

  loadFeatures(): void {
    // You can customize this to fetch features from your API
    // For now, using a placeholder structure
    this.features = [
      {
        icon: 'fa-shield-alt',
        title: 'Safe & Secure',
        description: 'Your safety is our top priority',
      },
      {
        icon: 'fa-star',
        title: 'Best Quality',
        description: 'We provide the best quality services',
      },
      {
        icon: 'fa-headset',
        title: '24/7 Support',
        description: 'Round the clock customer support',
      },
      {
        icon: 'fa-dollar-sign',
        title: 'Best Prices',
        description: 'Competitive prices for all services',
      },
    ];
  }
}
