import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ElementRef,
  Inject,
  PLATFORM_ID,
  AfterViewInit,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { EgyptMonthlyClimate } from '../../../core/interfaces/egypt-climate';

/**
 * Renders a smooth line chart (Chart.js) for average max temperature per month.
 * Tooltips and labels enabled; tension for curved line.
 */
@Component({
  selector: 'app-egypt-climate-chart',
  standalone: true,
  template: `
    <div class="climate-chart-wrap">
      <canvas #chartCanvas></canvas>
      @if (locationName) {
        <p class="chart-location">
          <span class="chart-location-icon" aria-hidden="true">📍</span>
          {{ locationName }}
        </p>
      }
    </div>
  `,
  styleUrl: './egypt-climate-chart.component.scss',
})
export class EgyptClimateChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  /** Monthly climate data (12 months) */
  @Input() monthlyData: EgyptMonthlyClimate[] = [];
  /** Location name shown below the chart */
  @Input() locationName = '';

  private chartInstance: any = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    this.drawChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (isPlatformBrowser(this.platformId) && (changes['monthlyData'] || changes['locationName'])) {
      this.drawChart();
    }
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  private drawChart(): void {
    if (!isPlatformBrowser(this.platformId) || !this.chartCanvas?.nativeElement) return;
    if (!this.monthlyData?.length) return;

    this.destroyChart();

    import('chart.js/auto').then((ChartJS) => {
      const Chart = ChartJS.default;
      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (!ctx) return;

      const labels = this.monthlyData.map((m) => m.month.substring(0, 3));
      const values = this.monthlyData.map((m) => m.avgTempMax);

      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Avg max temp (°C)',
              data: values,
              borderColor: 'rgb(243, 156, 18)',
              backgroundColor: 'rgba(243, 156, 18, 0.1)',
              fill: false,
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: 'rgb(243, 156, 18)',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          interaction: {
            intersect: false,
            mode: 'index',
          },
          plugins: {
            tooltip: {
              enabled: true,
              callbacks: {
                label: (item: any) => `${item.dataset.label}: ${item.raw}°C`,
              },
            },
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { maxRotation: 45, minRotation: 0 },
            },
            y: {
              grid: { color: 'rgba(0,0,0,0.06)' },
              ticks: {
                callback: (value: string | number) =>
                  typeof value === 'number' ? `${value}°C` : value,
              },
            },
          },
        },
      });
    });
  }

  private destroyChart(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }
}
