import { Component, ChangeDetectorRef } from '@angular/core';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TourCartComponent } from '../../shared/components/tour-cart/tour-cart.component';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [BannerComponent, CommonModule, ReactiveFormsModule, TourCartComponent, CarouselModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  constructor(
    private _BookingService: BookingService,
    private toaster: ToastrService,
    private _Router: Router,
    private _cdr: ChangeDetectorRef
  ) {}

  backgroundImage: string = '../../../assets/image/banner.webp';
  checkoutForm!: FormGroup;
  AllCountries: any[] = [];
  checkoutData: object = {};
  haveData: boolean = false;
  CartData: any[] = [];
  couponApplied: boolean = false;
  totalPrice: number = 0; // Cache total price to avoid ExpressionChangedAfterItHasBeenCheckedError

  ngOnInit(): void {
    this.getCountries();
    this.getCartData();

    this.checkoutForm = new FormGroup({
      first_name: new FormControl('', [Validators.required]),
      last_name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      notes: new FormControl(''),
      coupon_id: new FormControl(''),
      currency_id: new FormControl(1),
    });
  }

  getCheckoutData(): void {
    console.log(this.checkoutForm.value);
    console.log(this.checkoutForm.valid);

    if (!this.checkoutForm.valid) {
      // this.toaster.error('Please fill all required fields');
      return;
    }

    this.checkoutData = { ...this.checkoutForm.value };
    const couponCode = this.checkoutForm.get('coupon_id')?.value?.trim();

    if (couponCode && this.couponApplied) {
      // coupon code found, apply coupon and send checkout data
      this.applyCoupon();
      this.sendCheckoutData();
      this.CartData = []; // clear cart data
      this.haveData = false;
      this._Router.navigate(['/']);
      this.toaster.success('Order placed successfully');
    } else {
      // no coupon code, send checkout data without coupon
      this.checkoutData = {
        ...this.checkoutData,
        coupon_id: '',
      };
      this.sendCheckoutData();
      this.CartData = [];
      this.haveData = false;
      this._Router.navigate(['/']);
      this.toaster.success('Order placed successfully');
    }
  }

  applyCoupon(): void {
    const couponCode = this.checkoutForm.get('coupon_id')?.value?.trim();
    if (couponCode && couponCode !== '') {
      this._BookingService.getCoupon(couponCode).subscribe({
        next: (cResponse) => {
          // console.log(cResponse);
          this.toaster.success(cResponse.message);
          // Use setTimeout to defer update to next change detection cycle
          setTimeout(() => {
            // Update checkoutData with coupon_id from response if available
            if (cResponse.data?.id) {
              this.checkoutData = {
                ...this.checkoutData,
                coupon_id: cResponse.data.id,
              };
              this.couponApplied = true;
            }
            this._cdr.markForCheck();
            // Send checkout data with coupon
            // this.sendCheckoutData();
          }, 0);
        },
        error: (cError) => {
          // console.log(cError);
          this.toaster.error(cError.error?.message || 'Invalid coupon code');
          setTimeout(() => {
            this.couponApplied = false;
            this._cdr.markForCheck();
          }, 0);
        },
      });
    } else {
      this.toaster.error('Please enter a coupon code');
      setTimeout(() => {
        this.couponApplied = false;
        this._cdr.markForCheck();
      }, 0);
    }
  }

  private sendCheckoutData(): void {
    this._BookingService.sendCheckoutData(this.checkoutData).subscribe({
      next: (response) => {
        // console.log(response);
        this.toaster.success(response.message);
        // Optionally reset form or navigate to success page
        this.checkoutForm.reset();
      },
      error: (err) => {
        // console.log(err);
        this.toaster.error(err.error?.message || 'Error submitting checkout');
      },
    });
  }

  getCartData() {
    this._BookingService.getCartList().subscribe({
      next: (response) => {
        // Use setTimeout to defer update to next change detection cycle
        setTimeout(() => {
          this.CartData = response.data;
          if (this.CartData.length > 0) {
            this.haveData = true;
          } else {
            this.haveData = false;
          }
          // Update total price cache
          this.totalPrice = this.calculateTotalPrice();
          this._cdr.markForCheck();
          console.log('CartData', this.CartData);
        }, 0);
      },
      error: (err) => {
        console.log('Error', err);
      },
    });
  }

  // Private method to calculate total price
  private calculateTotalPrice(): number {
    if (!this.CartData || this.CartData.length === 0) {
      return 0;
    }
    return this.CartData.reduce((sum: number, cart: any) => sum + (cart.totalPrice || 0), 0);
  }

  // Public getter that returns cached value to avoid ExpressionChangedAfterItHasBeenCheckedError
  getTotalPrice(): number {
    return this.totalPrice;
  }

  getCountries() {
    this._BookingService.getCountries().subscribe({
      next: (response) => {
        // Use setTimeout to defer update to next change detection cycle
        setTimeout(() => {
          this.AllCountries = response.data;
          this._cdr.markForCheck();
          console.log('AllCountries', this.AllCountries);
        }, 0);
      },
      error: (err) => {
        console.log('Error', err);
      },
    });
  }

  cartListOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    smartSpeed: 2500,
    navText: ['', ''],
    items: 1,
    autoplay: true,
    margin: 20,
    nav: false,
  };
}
