import { Component, OnInit } from '@angular/core';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EgyptWeatherService } from '../../services/egypt-weather.service';
import { EgyptClimateTableComponent, EgyptClimateTableRow } from '../../shared/components/egypt-climate-table/egypt-climate-table.component';

@Component({
  selector: 'app-best-time-to-visit',
  imports: [BannerComponent, RouterLink, CommonModule, EgyptClimateTableComponent],
  standalone: true,
  templateUrl: './best-time-to-visit.component.html',
  styleUrl: './best-time-to-visit.component.scss',
})
export class BestTimeToVisit implements OnInit {
  backgroundImage: string = '../../../assets/image/banner.webp';

  readonly periodKeys = ['jan-mar', 'apr-may', 'jun', 'jul-aug', 'sep', 'oct-dec'] as const;
  selectedPeriod: 'jan-mar' | 'apr-may' | 'jun' | 'jul-aug' | 'sep' | 'oct-dec' = 'jan-mar';

  /** Egypt Climate Guide: table rows (destination + monthly data) */
  climateTableRows: EgyptClimateTableRow[] = [];
  climateLoading = true;
  climateError = false;

  constructor(private egyptWeather: EgyptWeatherService) {}

  ngOnInit(): void {
    this.egyptWeather.getAllGovernoratesClimate().subscribe({
      next: (map) => {
        this.climateTableRows = this.egyptWeather.governorates.map((g) => ({
          name: g.name,
          monthly: map.get(g.id) ?? [],
        }));
        this.climateLoading = false;
        this.climateError = false;
      },
      error: () => {
        this.climateLoading = false;
        this.climateError = true;
      },
    });
  }

  selectPeriod(period: 'jan-mar' | 'apr-may' | 'jun' | 'jul-aug' | 'sep' | 'oct-dec'): void {
    this.selectedPeriod = period;
  }
}
