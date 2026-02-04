import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, tap } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { MakeTripService } from '../../../services/make-trip.service';

@Component({
  selector: 'app-make-trip-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './make-trip-form.component.html',
  styleUrl: './make-trip-form.component.scss',
})
export class MakeTripFormComponent implements OnInit, OnDestroy {
  private $destroy = new Subject<void>();
  destinationForm!: FormGroup;
  destinationsList: any[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dataService: DataService,
    private makeTripService: MakeTripService,
    private cdr: ChangeDetectorRef
  ) {
    this.destinationForm = this.fb.group({
      location: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadDestinations();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  loadDestinations(): void {
    this.dataService
      .getDestination()
      .pipe(
        takeUntil(this.$destroy),
        tap((res) => {
          const destinations = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
          if (Array.isArray(destinations) && destinations.length > 0) {
            setTimeout(() => {
              this.destinationsList = destinations;
              this.cdr.markForCheck();
            }, 0);
          } else {
            this.destinationsList = [];
          }
        })
      )
      .subscribe({
        error: (err) => {
          console.error('Error loading destinations:', err);
          this.destinationsList = [];
        },
      });
  }

  onSearch(): void {
    if (this.destinationForm.valid) {
      const selectedLocation = this.destinationForm.get('location')?.value;
      
      if (selectedLocation) {
        // Set the destination in MakeTripService to skip first step
        this.makeTripService.setMakeTripSteps({
          destination: selectedLocation,
          fromDuration: null,
          ToDuration: null,
          appro: null,
        });

        // Navigate to make trip page
        this.router.navigate(['/makeTrip']);
      }
    }
  }

  onContactGuide(): void {
    // Navigate to contact page
    this.router.navigate(['/contact']);
  }
}
