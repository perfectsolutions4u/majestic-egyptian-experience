import { Component, Input } from '@angular/core';
import type { EgyptMonthlyClimate } from '../../../core/interfaces/egypt-climate';

/** Single row: destination name + monthly data */
export interface EgyptClimateTableRow {
  name: string;
  monthly: EgyptMonthlyClimate[];
}

/**
 * Responsive table: months as columns, each row = destination with Avg Max Temp and Rainfall per month.
 * Horizontally scrollable on mobile.
 */
@Component({
  selector: 'app-egypt-climate-table',
  standalone: true,
  templateUrl: './egypt-climate-table.component.html',
  styleUrl: './egypt-climate-table.component.scss',
})
export class EgyptClimateTableComponent {
  /** Table rows: one per governorate/destination */
  @Input() rows: EgyptClimateTableRow[] = [];
  /** Short month labels for header (e.g. Jan, Feb) */
  readonly monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  getMonthIndex(monthId: number): number {
    return (monthId - 1) % 12;
  }

  getMonth(row: EgyptClimateTableRow, monthIndex: number): EgyptMonthlyClimate | null {
    const m = row.monthly?.find((x) => x.monthId === monthIndex + 1);
    return m ?? null;
  }
}
