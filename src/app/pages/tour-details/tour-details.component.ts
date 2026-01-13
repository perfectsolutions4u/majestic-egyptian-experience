import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject,
  HostListener,
  ViewChild,
} from '@angular/core';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Itour } from '../../core/interfaces/itour';
import { CommonModule } from '@angular/common';
import { OwlOptions, CarouselModule } from 'ngx-owl-carousel-o';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FaqContent } from '../../shared/components/faq-content/faq-content';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TourCartComponent } from '../../shared/components/tour-cart/tour-cart.component';
import { BookingService } from '../../services/booking.service';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { DatepickerService } from '../../services/datepicker.service';

declare var bootstrap: any;

@Component({
  selector: 'app-tour-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CarouselModule,
    FaqContent,
    TourCartComponent,
    RouterLink,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
  ],
  templateUrl: './tour-details.component.html',
  styleUrl: './tour-details.component.scss',
})
export class TourDetailsComponent implements OnInit {
  @ViewChild('bookingDatepicker') bookingDatepicker!: MatDatepicker<Date>;
  @ViewChild('enquiryDatepicker') enquiryDatepicker!: MatDatepicker<Date>;

  constructor(
    private _DataService: DataService,
    private _BookingService: BookingService,
    private _ActivatedRoute: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private _ToastrService: ToastrService,
    private _Router: Router,
    private datepickerService: DatepickerService
  ) {}
  slug: string = '';
  tour: Itour | null = null;
  backgroundImage: string = '../../../assets/image/banner.webp';
  openIndex: number | null = null;
  includedList: string[] = [];
  excludedList: string[] = [];
  private sanitizer = inject(DomSanitizer);
  writeReview!: FormGroup;
  enquiryForm!: FormGroup;
  isLoading: boolean = false;
  isEnquirySubmitting: boolean = false;
  settingsEmail: string = '';
  showEmailConfirmation: boolean = false;
  emailPreview: { to: string; subject: string; body: string } = {
    to: '',
    subject: '',
    body: '',
  };
  reviews: any[] = [];
  relatedTours: Itour[] = [];
  bookingForm!: FormGroup;
  tourOptions: any[] = [];
  // tour pricing
  adultPrice: number = 0;
  childPrice: number = 0;
  infantPrice: number = 0;
  totalPrice: number = 0;
  totalAddOnsPrice: number = 0;

  // Options state management
  optionStates: Map<
    number,
    { adults: number; children: number; isSelected: boolean; price: number }
  > = new Map();

  // booking form UI state
  isTravelersDropdownOpen: boolean = false;
  selectedTourType: string = '';
  isDatePickerOpen: boolean = false;
  openOptionDropdowns: Map<number, boolean> = new Map();

  ngOnInit(): void {
    // Get settings email
    this._DataService.getSetting().subscribe({
      next: (res) => {
        if (res?.data) {
          const emailSetting = res.data.find((item: any) => item.option_key === 'email_address');
          this.settingsEmail = Array.isArray(emailSetting?.option_value)
            ? emailSetting.option_value[0] || ''
            : emailSetting?.option_value || '';
        }
      },
    });

    this._ActivatedRoute.params.subscribe((params) => {
      this.slug = params['slug'];
      this._DataService.getTourBySlug(this.slug).subscribe((res) => {
        if (res && res.data) {
          Promise.resolve().then(() => {
            this.tour = res.data;
            // console.log('tour', this.tour);
            // get related tours by destinations or categories
            if (this.tour?.destinations) {
              const destinationSlug = this.tour.destinations[0].slug;
              this._DataService.getTours({ destination_slug: destinationSlug }).subscribe((res) => {
                this.relatedTours = res.data.data;
                this._cdr.markForCheck();
              });
            } else if (this.tour?.categories) {
              const categorySlug = this.tour.categories[0].slug;
              this._DataService.getTours({ category_slug: categorySlug }).subscribe((res) => {
                this.relatedTours = res.data.data;
                this._cdr.markForCheck();
              });
            } else {
              this.relatedTours = [];
            }
            console.log('related tours', this.relatedTours);

            this.writeReview.get('tour_id')?.setValue(this.tour?.id);
            this.bookingForm.get('tour_id')?.setValue(this.tour?.id);
            this.enquiryForm.get('tour_id')?.setValue(this.tour?.id);
            // get tour pricing for adults in first = 1
            this.getTourPricing(this.bookingForm.get('adults')?.value);
            // get reviews by tour id
            // if (this.tour?.id) {
            //   this.getReviews(this.tour.id);
            // }
            // Sanitize HTML descriptions for itinerary days
            if (this.tour && this.tour.days && Array.isArray(this.tour.days)) {
              this.tour.days = this.tour.days.map((day: any) => ({
                ...day,
                safeDescription: day.description
                  ? this.sanitizer.bypassSecurityTrustHtml(day.description)
                  : this.sanitizer.bypassSecurityTrustHtml(''),
              }));
            }
            // Convert included and excluded strings to arrays
            if (this.tour && this.tour.included) {
              this.includedList = this.tour.included
                .split(',')
                .map((item: string) => item.trim())
                .filter((item: string) => item.length > 0);
            }
            if (this.tour && this.tour.excluded) {
              this.excludedList = this.tour.excluded
                .split(',')
                .map((item: string) => item.trim())
                .filter((item: string) => item.length > 0);
            }

            // get tour options and initialize their state
            if (this.tour && this.tour.options) {
              this.tourOptions = this.tour.options.map((option: any) => option.name);
              // Initialize option states
              this.tour.options.forEach((option: any) => {
                this.optionStates.set(option.id, {
                  adults: 0,
                  children: 0,
                  isSelected: false,
                  price: 0,
                });
              });
            }
            console.log('tour', this.tour);
            this._cdr.markForCheck();
          });
        }
      });
    });

    this.writeReview = new FormGroup({
      reviewer_name: new FormControl('', [Validators.required]),
      rate: new FormControl('', [Validators.required, Validators.min(0), Validators.max(5)]),
      confirm: new FormControl(''),
      content: new FormControl(''),
      tour_id: new FormControl<number | null>(null),
    });

    this.bookingForm = new FormGroup({
      start_date: new FormControl('', [Validators.required]),
      adults: new FormControl('1', [Validators.required]),
      children: new FormControl('0'),
      infants: new FormControl('0'),
      tour_id: new FormControl<number | null>(null),
      tour_type: new FormControl(''),
    });

    this.enquiryForm = new FormGroup({
      full_name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      number_of_people: new FormControl('', [Validators.required]),
      travel_date: new FormControl('', [Validators.required]),
      tour_details: new FormControl(''),
      save_info: new FormControl(false),
      tour_id: new FormControl<number | null>(null),
    });
  }

  submitWriteReview(): void {
    if (this.writeReview.valid) {
      this.isLoading = true;
      this._DataService
        .writeReview(this.writeReview.get('tour_id')?.value, this.writeReview.value)
        .subscribe({
          next: (res) => {
            console.log(res);

            this._ToastrService.success(res.message);
            this.writeReview.reset();
            this.isLoading = false;
            this.getReviews(this.writeReview.get('tour_id')?.value);
            // Close modal and remove all backdrops
            this.closeModalAndRemoveBackdrop('writeReviewModal');
            this._cdr.markForCheck();
          },
          error: (err) => {
            this._ToastrService.error(err.error.message);
            this.isLoading = false;
            this._cdr.markForCheck();
          },
        });
    }
  }

  getReviews(id: number): void {
    this._DataService.getreviewByTourId(id).subscribe((res) => {
      console.log(res);
      this.reviews = res.data;
    });
  }

  // check pricing
  getTourPricing(adultNum: number) {
    if (!this.tour) {
      this._ToastrService.error('No data available.');
      // console.log('No data available.');
      return;
    }

    const childrenNum = parseInt(this.bookingForm.get('children')?.value || '0');
    const infantsNum = parseInt(this.bookingForm.get('infants')?.value || '0');

    if (this.tour.pricing_groups && this.tour.pricing_groups.length > 0) {
      // console.log("Pricing Groups Exist:", this.tourData.pricing_groups);

      // Find the correct pricing group based on adultNum
      const matchedGroup = this.tour.pricing_groups.find(
        (group: { from: number; to: number }) => adultNum >= group.from && adultNum <= group.to
      );

      if (matchedGroup) {
        // console.log("Matched Pricing Group:", matchedGroup);
        this.adultPrice = matchedGroup.price;
        this.childPrice = matchedGroup.child_price;
        // Calculate total price based on actual counts
        this.totalPrice =
          adultNum * this.adultPrice +
          childrenNum * this.childPrice +
          infantsNum * this.infantPrice;
        // console.log("Adult Price:", matchedGroup.price);
        // console.log("Child Price:", matchedGroup.child_price);
      } else {
        // console.log('No matching pricing group found.');
        this.adultPrice = this.tour.adult_price;
        this.childPrice = this.tour.child_price;
        this.infantPrice = this.tour.infant_price;
        // Calculate total price based on actual counts
        this.totalPrice =
          adultNum * this.adultPrice +
          childrenNum * this.childPrice +
          infantsNum * this.infantPrice;
      }
    } else {
      // If no pricing_groups exist, return default prices
      // console.log('No Pricing Groups - Using Default Prices');
      this.adultPrice = this.tour.adult_price;
      this.childPrice = this.tour.child_price;
      this.infantPrice = this.tour.infant_price;
      // Calculate total price based on actual counts
      this.totalPrice =
        adultNum * this.adultPrice + childrenNum * this.childPrice + infantsNum * this.infantPrice;
    }

    // Recalculate options prices and total
    this.calculateTotalAddOnsPrice();
  }

  // Calculate option price based on adults and children count
  getOptionPricing(option: any, adults: number, children: number): number {
    if (!option) return 0;

    let adultPrice = option.adult_price || 0;
    let childPrice = option.child_price || 0;

    // Check if option has pricing_groups
    if (option.pricing_groups && option.pricing_groups.length > 0) {
      const totalPeople = adults + children;
      const matchedGroup = option.pricing_groups.find(
        (group: { from: number; to: number }) =>
          totalPeople >= group.from && totalPeople <= group.to
      );

      if (matchedGroup) {
        adultPrice = matchedGroup.price;
        childPrice = matchedGroup.child_price;
      }
    }

    return adults * adultPrice + children * childPrice;
  }

  // Calculate total add-ons price
  calculateTotalAddOnsPrice(): void {
    this.totalAddOnsPrice = 0;
    this.optionStates.forEach((state, optionId) => {
      if (state.isSelected && (state.adults > 0 || state.children > 0)) {
        const option = this.tour?.options?.find((opt: any) => opt.id === optionId);
        if (option) {
          state.price = this.getOptionPricing(option, state.adults, state.children);
          this.totalAddOnsPrice += state.price;
        }
      }
    });
  }

  // Toggle option dropdown
  toggleOptionDropdown(optionId: number): void {
    const currentState = this.openOptionDropdowns.get(optionId) || false;
    this.openOptionDropdowns.set(optionId, !currentState);
  }

  // Check if option dropdown is open
  isOptionDropdownOpen(optionId: number): boolean {
    return this.openOptionDropdowns.get(optionId) || false;
  }

  // Increment option adults/children
  incrementOption(optionId: number, type: 'adults' | 'children'): void {
    const state = this.optionStates.get(optionId);
    if (!state) return;

    const currentOptionTotal = state.adults + state.children;
    const mainTourTravelers = this.getTotalTravelers();

    // Calculate total travelers across all options
    let allOptionsTotal = 0;
    this.optionStates.forEach((optState) => {
      allOptionsTotal += optState.adults + optState.children;
    });

    // Check if adding one more would exceed limit (main tour + all options)
    if (mainTourTravelers + allOptionsTotal < 20) {
      if (type === 'adults') {
        state.adults++;
      } else {
        state.children++;
      }
      state.isSelected = true;
      this.calculateTotalAddOnsPrice();
    }
  }

  // Decrement option adults/children
  decrementOption(optionId: number, type: 'adults' | 'children'): void {
    const state = this.optionStates.get(optionId);
    if (!state) return;

    if (type === 'adults' && state.adults > 0) {
      state.adults--;
    } else if (type === 'children' && state.children > 0) {
      state.children--;
    }

    // If both are 0, deselect
    if (state.adults === 0 && state.children === 0) {
      state.isSelected = false;
      state.price = 0;
    }

    this.calculateTotalAddOnsPrice();
  }

  // Get option state
  getOptionState(optionId: number) {
    return (
      this.optionStates.get(optionId) || { adults: 0, children: 0, isSelected: false, price: 0 }
    );
  }

  submitBookingForm(): void {
    if (this.bookingForm.valid) {
      // Format the date to YYYY-MM-DD to avoid timezone issues
      const formValue = { ...this.bookingForm.value };
      if (formValue.start_date instanceof Date) {
        const year = formValue.start_date.getFullYear();
        const month = String(formValue.start_date.getMonth() + 1).padStart(2, '0');
        const day = String(formValue.start_date.getDate()).padStart(2, '0');
        formValue.start_date = `${year}-${month}-${day}`;
      }

      // Add options data to form value
      const selectedOptions: any[] = [];
      this.optionStates.forEach((state, optionId) => {
        if (state.isSelected && (state.adults > 0 || state.children > 0)) {
          selectedOptions.push({
            option_id: optionId,
            adults: state.adults,
            children: state.children,
          });
        }
      });

      if (selectedOptions.length > 0) {
        formValue.options = selectedOptions;
      }

      // console.log(formValue);
      this._BookingService
        // ,localStorage.getItem('accessToken')
        .appendBookingData(formValue)
        .subscribe({
          next: (response) => {
            // console.log(response);
            if (response.status == true) {
              // console.log(response.status);
              // console.log(formValue);
              // console.log(localStorage.getItem('accessToken'));
              // Close modal and remove all backdrops
              this.closeModalAndRemoveBackdrop('availabilityModal');
              this._ToastrService.success(response.message);
              // Defer navigation to avoid ExpressionChangedAfterItHasBeenCheckedError
              setTimeout(() => {
                this._Router.navigate(['/cart']);
              }, 350); // Wait for modal to close
            }
          },
          error: (err) => {
            // Close modal and remove all backdrops
            this.closeModalAndRemoveBackdrop('availabilityModal');
            this._ToastrService.error(err.error.message);
          },
        });
    } else {
      this._ToastrService.error('Form is not valid , must choose start data');
    }
  }

  galleryOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    autoplay: true,
    smartSpeed: 2500,
    margin: 20,
    dots: false,
    navText: [
      '<i class="fa-solid fa-chevron-left"></i>',
      '<i class="fa-solid fa-chevron-right"></i>',
    ],
    responsive: {
      0: { items: 1 },
      400: { items: 2 },
      586: { items: 3 },
      768: { items: 4 },
      992: { items: 5 },
    },
    nav: true,
  };

  relatedToursOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    autoplay: true,
    smartSpeed: 2500,
    margin: 20,
    dots: true,
    navText: [
      '<i class="fa-solid fa-chevron-left"></i>',
      '<i class="fa-solid fa-chevron-right"></i>',
    ],
    responsive: {
      0: { items: 1 },
      576: { items: 2 },
      768: { items: 2 },
      992: { items: 3 },
    },
    nav: true,
  };

  toggleItinerary(index: number): void {
    if (this.openIndex === index) {
      this.openIndex = null;
    } else {
      this.openIndex = index;
    }
  }

  isOpen(index: number): boolean {
    return this.openIndex !== null && this.openIndex === index;
  }

  // increment number of adults, children, infants
  increment(type: string) {
    let currentValue = parseInt(this.bookingForm.get(type)?.value || '0');
    const totalTravelers = this.getTotalTravelers();
    if (totalTravelers < 20) {
      this.bookingForm.get(type)?.setValue((currentValue + 1).toString());
      // Update pricing when travelers change
      const adultsNum = parseInt(this.bookingForm.get('adults')?.value || '0');
      this.getTourPricing(adultsNum);
    }
  }

  // decrement number
  decrement(type: string) {
    let currentValue = parseInt(this.bookingForm.get(type)?.value || '0');
    if (currentValue > 0) {
      this.bookingForm.get(type)?.setValue((currentValue - 1).toString());
      // Update pricing when travelers change
      const adultsNum = parseInt(this.bookingForm.get('adults')?.value || '0');
      this.getTourPricing(adultsNum);
    }
  }

  // Toggle travelers dropdown
  toggleTravelersDropdown(): void {
    this.isTravelersDropdownOpen = !this.isTravelersDropdownOpen;
  }

  // Format date for display
  getFormattedDate(): string {
    const dateValue = this.bookingForm.get('start_date')?.value;
    if (!dateValue) {
      return 'Select Date';
    }

    // Handle both Date objects and date strings (YYYY-MM-DD format)
    let date: Date;
    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'string') {
      // Handle YYYY-MM-DD format from HTML5 date input
      date = new Date(dateValue + 'T00:00:00');
    } else {
      date = new Date(dateValue);
    }

    if (isNaN(date.getTime())) {
      return 'Select Date';
    }

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
      year: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  }

  // Get travelers display text
  getTravelersText(): string {
    const adults = this.bookingForm.get('adults')?.value || 0;
    const children = this.bookingForm.get('children')?.value || 0;
    const infants = this.bookingForm.get('infants')?.value || 0;
    const parts: string[] = [];
    if (adults > 0) parts.push(`${adults} ${adults === 1 ? 'Adult' : 'Adults'}`);
    if (children > 0) parts.push(`${children} ${children === 1 ? 'Child' : 'Children'}`);
    if (infants > 0) parts.push(`${infants} ${infants === 1 ? 'Infant' : 'Infants'}`);
    return parts.length > 0 ? parts.join(', ') : 'Select Travelers';
  }

  // Select tour type
  selectTourType(type: string): void {
    this.selectedTourType = type;
    this.bookingForm.get('tour_type')?.setValue(type);
  }

  // Get total travelers count
  getTotalTravelers(): number {
    const adults = parseInt(this.bookingForm.get('adults')?.value || '0');
    const children = parseInt(this.bookingForm.get('children')?.value || '0');
    const infants = parseInt(this.bookingForm.get('infants')?.value || '0');
    return adults + children + infants;
  }

  // Handle date change
  onDateChange(): void {
    this.isDatePickerOpen = false;
    this._cdr.markForCheck();
  }

  // Handle datepicker closed event
  onDatepickerClosed(): void {
    this.isDatePickerOpen = false;
    this._cdr.markForCheck();
  }

  // Open date picker
  openDatePicker(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.isDatePickerOpen = true;
    setTimeout(() => {
      this.datepickerService.openDatePicker(this.bookingDatepicker);
    }, 0);
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.booking-input-wrapper')) {
      this.isDatePickerOpen = false;
      this.isTravelersDropdownOpen = false;
    }
    // Close option dropdowns if clicking outside
    if (!target.closest('.option-dropdown-wrapper')) {
      this.openOptionDropdowns.forEach((_, optionId) => {
        this.openOptionDropdowns.set(optionId, false);
      });
    }
  }

  // Submit enquiry form - show email preview
  submitEnquiryForm(): void {
    if (this.enquiryForm.valid) {
      const formValue = { ...this.enquiryForm.value };

      // Format the date
      let formattedDate = '';
      if (formValue.travel_date instanceof Date) {
        const year = formValue.travel_date.getFullYear();
        const month = String(formValue.travel_date.getMonth() + 1).padStart(2, '0');
        const day = String(formValue.travel_date.getDate()).padStart(2, '0');
        formattedDate = `${day}/${month}/${year}`;
      } else if (formValue.travel_date) {
        const date = new Date(formValue.travel_date + 'T00:00:00');
        if (!isNaN(date.getTime())) {
          formattedDate = date.toLocaleDateString('en-GB');
        }
      }

      // Format email body
      const tourTitle = this.tour?.title || 'Tour Enquiry';
      const emailBody = `
New Tour Enquiry

Tour: ${tourTitle}
Full Name: ${formValue.full_name}
Email: ${formValue.email}
Number of People: ${formValue.number_of_people}
Travel Date: ${formattedDate || 'Not specified'}
Tour Details: ${formValue.tour_details || 'N/A'}
Save Info: ${formValue.save_info ? 'Yes' : 'No'}
      `.trim();

      // Set email preview
      this.emailPreview = {
        to: this.settingsEmail || 'info@example.com',
        subject: `Tour Enquiry - ${tourTitle}`,
        body: emailBody,
      };

      // Show confirmation modal
      this.showEmailConfirmation = true;
      this._cdr.markForCheck();
    } else {
      this._ToastrService.error('Please fill in all required fields');
    }
  }

  // Confirm and send email
  confirmAndSendEmail(): void {
    if (!this.emailPreview.to) {
      this._ToastrService.error('Email address not found in settings');
      return;
    }

    this.isEnquirySubmitting = true;

    // Create mailto link
    const subject = encodeURIComponent(this.emailPreview.subject);
    const body = encodeURIComponent(this.emailPreview.body);
    const mailtoLink = `mailto:${this.emailPreview.to}?subject=${subject}&body=${body}`;

    // Open email client
    window.location.href = mailtoLink;

    // Show success message and reset form
    setTimeout(() => {
      this._ToastrService.success('Email client opened. Please send the enquiry.');
      this.enquiryForm.reset();
      this.enquiryForm.get('tour_id')?.setValue(this.tour?.id);
      this.isEnquirySubmitting = false;
      this.showEmailConfirmation = false;
      this.closeModalAndRemoveBackdrop('enquiryModal');
      this._cdr.markForCheck();
    }, 500);
  }

  // Cancel email sending
  cancelEmailSending(): void {
    this.showEmailConfirmation = false;
    this._cdr.markForCheck();
  }

  // Open enquiry date picker
  openEnquiryDatePicker(): void {
    this.datepickerService.openDatePicker(this.enquiryDatepicker);
  }

  // Format enquiry date for display
  getEnquiryFormattedDate(): string {
    const dateValue = this.enquiryForm.get('travel_date')?.value;
    if (!dateValue) {
      return 'Select Date';
    }

    let date: Date;
    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue + 'T00:00:00');
    } else {
      date = new Date(dateValue);
    }

    if (isNaN(date.getTime())) {
      return 'Select Date';
    }

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  }

  // Close modal and remove all backdrops
  closeModalAndRemoveBackdrop(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      } else {
        // If no instance exists, create one and hide it
        const newModal = new bootstrap.Modal(modalElement);
        newModal.hide();
      }
    }

    // Remove all modal backdrops
    setTimeout(() => {
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach((backdrop) => {
        backdrop.remove();
      });
      // Remove modal-open class from body
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }, 300); // Wait for modal fade animation
  }
}
