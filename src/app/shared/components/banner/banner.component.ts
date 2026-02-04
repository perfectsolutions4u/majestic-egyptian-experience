import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss'
})
export class BannerComponent {
  @Input() title: string = 'Welcome';
  @Input() subtitle: string = 'Discover amazing destinations';
  @Input() backgroundImage: string = '';
}

