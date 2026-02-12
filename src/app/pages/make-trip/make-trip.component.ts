import { MakeTripService, TripPayload } from './../../services/make-trip.service';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormControl,
  FormGroup,
  FormArray,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
// import {
//   MaketripService,
//   TripPayload,
// } from '../../services/make-trip.service';
// import { BookingService } from '../../core/services/booking.service';
import { ToastrService } from 'ngx-toastr';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
// import { BannerComponent } from '../../components/banner/banner.component';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  query,
  stagger,
  keyframes,
} from '@angular/animations';
// import { SeoService } from '../../core/services/seo.service';
import { SeoService } from '../../services/seo.service';
import { Subject, takeUntil, tap } from 'rxjs';
import { _ } from '@ngx-translate/core';
import { DataService } from '../../services/data.service';
import { DatepickerService } from '../../services/datepicker.service';

@Component({
  selector: 'app-make-trip',
  standalone: true,
  imports: [
    MatStepperModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('slideInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('staggerCards', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(100, [
              animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
  templateUrl: './make-trip.component.html',
  styleUrl: './make-trip.component.scss',
})
export class MakeTripComponent implements OnInit, OnDestroy {
  private $destory = new Subject<void>();
  constructor(
    private _MaketripService: MakeTripService,
    private _DataService: DataService,
    private toaster: ToastrService,
    private _Router: Router,
    private seoService: SeoService,
    private cdr: ChangeDetectorRef,
    private datepickerService: DatepickerService
  ) {}

  @ViewChild('stepper') stepper!: MatStepper;

  bannerTitle: string = 'make Your trip';

  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  submitFormGroup!: FormGroup;
  prefilled = false; // لو في داتا من Home

  monthList = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  makeTripForm: any = {};
  countriesList: any[] = [];
  destinationList: any[] = [];
  minBudget: number = 0;
  maxBudget: number = 0;

  ngOnInit() {
    this.seoService.updateSeoData(
      {},
      'scrappe voyager   - Make Your Trip',
      'Create your custom travel itinerary with scrappe voyager. Plan your perfect trip tailored to your preferences.',
      '../../../assets/image/scrappe-voyager-logo.webp'
    );
    this.showCountries();
    this.buildForms();

    // this._MaketripService.getCountries().subscribe({
    //   next: (response) => {
    //     this.countriesList = response.data;
    //     console.log('make trip page -- countries (from API) -- ', this.countriesList);
    //     this.cdr.markForCheck();
    //   },
    //   error: (err) => {
    //     console.log(err.error.message);
    //   },
    // });

    this._MaketripService.getDestination().subscribe({
      next: (response) => {
        this.destinationList = response.data.data.reverse() || [];
        // Trigger change detection after async data update
        this.cdr.markForCheck();
        // console.log('destinationList', this.destinationList);
      },
      error: (err) => {
        // console.log(err.error.message);
      },
    });

    this._MaketripService.makeTripSteps$.subscribe((data) => {
      // this.tripData = data;
      // console.log('Received shared data:', data);

      // patch data
      if (!data) {
        this.prefilled = false;
        return;
      }
      this.applyIncoming(data);
      this.prefilled = true;

      // ignore first , second step after patchh values
      queueMicrotask(() => {
        if (this.stepper) this.stepper.selectedIndex = 2;
      });
    });

    this.onBudgetChange();
  }

  private buildForms() {
    this.firstFormGroup = new FormGroup({
      destination: new FormArray([], [this.atLeastOneDestinationValidator]), // Changed to FormArray to support multiple selections
    });

    this.secondFormGroup = new FormGroup({
      type: new FormControl('exact_time'),
      start_date: new FormControl(null),
      end_date: new FormControl(null),
      month: new FormControl(null),
      days: new FormControl(''),
    });

    this.submitFormGroup = new FormGroup({
      first_name: new FormControl('', [Validators.required]),
      last_name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      nationality: new FormControl('', [Validators.required]),
      phone_number: new FormControl('' , [Validators.required, Validators.pattern(/^01[0-2|5]\d{8}$/)]),
      adults: new FormControl(0),
      children: new FormControl(0),
      infants: new FormControl(0),
      additional_notes: new FormControl(''),
      min_person_budget: new FormControl(5000),
      max_person_budget: new FormControl(20000),
      flight_offer: new FormControl(0),
    });
  }

  private toDate(v: any) {
    return v instanceof Date ? v : v ? new Date(v) : null;
  }

  private applyIncoming(data: TripPayload) {
    const destination = data.destination ?? '';
    const fromDate = this.toDate(data.fromDuration ?? null);
    const toDate = this.toDate(data.ToDuration ?? null);
    const approx = data.appro ?? null;

    // Handle destination as array (can be string or array)
    const destinationArray = Array.isArray(destination)
      ? destination
      : destination
      ? [destination]
      : [];
    const destinationFormArray = this.firstFormGroup.get('destination') as FormArray;
    destinationFormArray.clear();
    destinationArray.forEach((dest: string) => {
      destinationFormArray.push(new FormControl(dest));
    });

    if (approx) {
      this.secondFormGroup.patchValue({
        type: 'approx_time',
        start_date: null,
        end_date: null,
        month: approx,
      });
    } else {
      this.secondFormGroup.patchValue({
        type: 'exact_time',
        start_date: fromDate,
        end_date: toDate,
        month: null,
      });
    }
    this.secondFormGroup.updateValueAndValidity({ emitEvent: false });
  }

  isDateTypeSelected(value: string): boolean {
    return this.secondFormGroup.get('type')?.value === value;
  }

  onToursChange(event: any, destinationValue: string) {
    const destinationFormArray = this.firstFormGroup.get('destination') as FormArray;
    const isChecked = event.target.checked;

    if (isChecked) {
      // Add destination if checked
      destinationFormArray.push(new FormControl(destinationValue));
    } else {
      // Remove destination if unchecked
      const index = destinationFormArray.controls.findIndex(
        (control) => control.value === destinationValue
      );
      if (index > -1) {
        destinationFormArray.removeAt(index);
      }
    }
  }

  isDestinationSelected(destinationValue: string): boolean {
    const destinationFormArray = this.firstFormGroup.get('destination') as FormArray;
    return destinationFormArray.controls.some((control) => control.value === destinationValue);
  }

  submitForm() {
    if (this.submitFormGroup.status == 'VALID') {
      // Get destinations array from FormArray
      const destinationFormArray = this.firstFormGroup.get('destination') as FormArray;
      const destinations = destinationFormArray.controls.map((control) => control.value);

      this.makeTripForm = {
        destination: destinations, // Send as array
        ...this.secondFormGroup.value,
        ...this.submitFormGroup.value,
      };

      this._MaketripService.sendDataTrip(this.makeTripForm).subscribe({
        next: (response) => {
          this.toaster.success(response.message);
          this._Router.navigate(['/']); //go to home page
        },
        error: (err) => {
          this.toaster.error(err.error.message);
        },
      });
    }
  }

  onBudgetChange() {
    this.minBudget = this.submitFormGroup.get('min_person_budget')?.value;
    this.maxBudget = this.submitFormGroup.get('max_person_budget')?.value;
  }

  increment(type: string) {
    let currentValue = this.submitFormGroup.get(type)?.value || 0;
    if (currentValue < 12) {
      this.submitFormGroup.get(type)?.setValue(currentValue + 1);
    }
  }

  decrement(type: string) {
    let currentValue = this.submitFormGroup.get(type)?.value || 0;
    if (currentValue > 0) {
      this.submitFormGroup.get(type)?.setValue(currentValue - 1);
    }
  }

  showCountries() {
    // if found in cache, use cache
    const cachedCountries = this._DataService.getFromLocalStorage('majestic_countries');
    if (cachedCountries && cachedCountries.data) {
      setTimeout(() => {
        this.countriesList = cachedCountries.data.data;
        console.log('make trip page -- countries (from cache) -- ', this.countriesList);
        this.cdr.markForCheck();
      }, 0);
      return;
    } else {
    }

    this._DataService
      .getCountries()
      .pipe(
        takeUntil(this.$destory),
        tap((res) => {
          if (res && res.data) {
            setTimeout(() => {
              this.countriesList = res.data;
              console.log('make trip page -- countries (from API) -- ', this.countriesList);
              this.cdr.markForCheck();
            }, 0);
          }
        })
      )
      .subscribe();
  }

  // Custom validator to ensure at least one destination is selected
  private atLeastOneDestinationValidator(control: AbstractControl): ValidationErrors | null {
    const formArray = control as FormArray;
    if (formArray.length === 0) {
      return { atLeastOneRequired: true };
    }
    return null;
  }

  ngOnDestroy(): void {
    this.$destory.next();
    this.$destory.complete();
  }

  // Check if a form field is invalid and has been touched
  isFieldInvalid(fieldName: string): boolean {
    const field = this.submitFormGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
