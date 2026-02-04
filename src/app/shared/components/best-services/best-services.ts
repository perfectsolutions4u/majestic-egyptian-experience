// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { DataService } from '../../../services/data.service';

// @Component({
//   selector: 'app-best-services',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './best-services.component.html',
//   styleUrl: './best-services.component.scss',
// })
// export class BestServices implements OnInit {
//   private _DataService = inject(DataService);
//   services: any[] = [];

//   ngOnInit(): void {
//     this.loadServices();
//   }

//   loadServices(): void {
//     // You can customize this to fetch services from your API
//     // For now, using a placeholder structure
//     this.services = [
//       {
//         icon: 'fa-plane',
//         title: 'Best Destinations',
//         description: 'Explore amazing destinations around the world',
//       },
//       {
//         icon: 'fa-hotel',
//         title: 'Luxury Hotels',
//         description: 'Stay in the finest hotels and resorts',
//       },
//       {
//         icon: 'fa-utensils',
//         title: 'Fine Dining',
//         description: 'Experience exquisite culinary delights',
//       },
//     ];
//   }
// }
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-best-services',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './best-services.component.html',
  styleUrl: './best-services.component.scss',
})
export class BestServices {}