import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SeoService } from '../../services/seo.service';
import { BookingService } from '../../services/booking.service';
import { ToastrService } from 'ngx-toastr';
import { TourCartComponent } from '../../shared/components/tour-cart/tour-cart.component';
import { RouterLink } from '@angular/router';
import { BannerComponent } from '../../shared/components/banner/banner.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [TourCartComponent, RouterLink, BannerComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  constructor(
    private seoService: SeoService,
    private _BookingService: BookingService,
    private toaster: ToastrService,
    private _cdr: ChangeDetectorRef
  ) {}
  tourCart: any[] = [];
  haveData: boolean = false;
  backgroundImage: string = '../../../assets/image/cart-banner.jpg';

  ngOnInit(): void {
    this.seoService.updateSeoData(
      {},
      'majestic - Cart',
      'Manage your cart, bookings, and preferences with majestic egyptian experience. Access your account dashboard.',
      '../../../assets/image/majestic-logo.svg'
    );
    this.getListCart();
  }

  getListCart(): void {
    this._BookingService.getCartList().subscribe({
      next: (response: any) => {
        // Use setTimeout to defer update to next change detection cycle
        setTimeout(() => {
          this.tourCart = response.data;
          console.log('tourCart', this.tourCart);
          if (this.tourCart.length === 0) {
            this.haveData = false;
          } else {
            this.haveData = true;

            // Use total_price from API response if available, otherwise calculate it
            this.tourCart = response.data.map((tour: any) => ({
              ...tour,
              totalPrice: tour.total_price ||
                (tour.adults * tour.tour.adult_price +
                tour.children * tour.tour.child_price +
                tour.infants * tour.tour.infant_price),
            }));
          }
          this._cdr.markForCheck();
        }, 0);
      },
    });
  }

  deleteTourCart(tourCartId: number): void {
    this._BookingService.deleteTourCart(tourCartId).subscribe({
      next: (response: any) => {
        console.log('deleteTourCart', response.data);
        this.toaster.success(response.message);
        // Defer to avoid change detection issues
        setTimeout(() => {
          this.getListCart();
        }, 0);
      },
      error: (err: any) => {
        this.toaster.error(err.error.message);
      },
    });
  }

  clearTourCart(): void {
    this._BookingService.clearTourCart().subscribe({
      next: (response: any) => {
        console.log('clearTourCart', response.data);
        this.toaster.success(response.message);
        // Defer to avoid change detection issues
        setTimeout(() => {
          this.getListCart();
        }, 0);
      },
      error: (err: any) => {
        this.toaster.error(err.error.message);
      },
    });
  }
}
