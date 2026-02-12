import { Component } from '@angular/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-parteners',
  standalone: true,
  imports: [CarouselModule],
  templateUrl: './parteners.component.html',
  styleUrl: './parteners.component.scss',
})
export class Parteners {
  partners: any[] = [
    {
      id: 1,
      image: '../../../../assets/image/partners/partner-01.webp',
    },
    {
      id: 2,
      image: '../../../../assets/image/partners/partner-02.webp',
    },
    {
      id: 3,
      image: '../../../../assets/image/partners/partner-03.webp',
    },
    {
      id: 4,
      image: '../../../../assets/image/partners/partner-04.webp',
    },
    {
      id: 5,
      image: '../../../../assets/image/partners/partner-05.webp',
    },
    {
      id: 6,
      image: '../../../../assets/image/partners/partner-06.webp',
    },
  ];

  partenersOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    nav: false,
    navText: ['<i class="fa fa-chevron-left"></i>', '<i class="fa fa-chevron-right"></i>'],
    responsive: {
      0: { items: 1 },
      360: { items: 2 },
      586: { items: 3 },
      768: { items: 4 },
      992: { items: 5 },
    },
    margin: 20,
    autoplay: true,
    smartSpeed: 3500,
  };
}