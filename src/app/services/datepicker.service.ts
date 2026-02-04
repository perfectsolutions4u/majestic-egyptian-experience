import { Injectable } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';

@Injectable({
  providedIn: 'root',
})
export class DatepickerService {
  /**
   * Opens a date picker if it exists
   * @param datepicker - The MatDatepicker instance to open
   */
  openDatePicker(datepicker: MatDatepicker<Date> | null | undefined): void {
    if (datepicker) {
      datepicker.open();
    }
  }

  /**
   * Opens a date range picker if it exists
   * @param dateRangePicker - The MatDateRangePicker instance to open
   */
  openDateRangePicker(dateRangePicker: any | null | undefined): void {
    if (dateRangePicker && typeof dateRangePicker.open === 'function') {
      dateRangePicker.open();
    }
  }
}

