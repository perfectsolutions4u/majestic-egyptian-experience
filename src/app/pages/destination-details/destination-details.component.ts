import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { SeoService } from '../../services/seo.service';
import { DataService } from '../../services/data.service';
import { ActivatedRoute } from '@angular/router';
import { IDestination } from '../../core/interfaces/idestination';
import { DomSanitizer } from '@angular/platform-browser';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { Itour } from '../../core/interfaces/itour';
import { TourCartComponent } from '../../shared/components/tour-cart/tour-cart.component';
import { WhyChooseUs } from '../../shared/components/why-choose-us/why-choose-us';
import { IBlog } from '../../core/interfaces/iblog';
import { BlogCartComponent } from '../../shared/components/blog-cart/blog-cart.component';

@Component({
  selector: 'app-destination-details',
  standalone: true,
  imports: [BannerComponent, CarouselModule, TourCartComponent, WhyChooseUs, BlogCartComponent],
  templateUrl: './destination-details.component.html',
  styleUrl: './destination-details.component.scss',
})
export class DestinationDetailsComponent implements OnInit {
  constructor(
    private _DataService: DataService,
    private cdr: ChangeDetectorRef,
    private _ActivatedRoute: ActivatedRoute,
    private seoService: SeoService
  ) {}

  backgroundImage: string = '../../../assets/image/banner.webp';
  destination: IDestination = {} as IDestination;
  isLoading: boolean = false;
  sanitizer = inject(DomSanitizer);
  relatedTours: Itour[] = [];
  recentBlogs: IBlog[] = [];

  ngOnInit(): void {
    this._ActivatedRoute.params.subscribe((params) => {
      let slug = params['slug'];
      this._DataService.getDestinationBySlug(slug).subscribe((res) => {
        if (res && res.data) {
          setTimeout(() => {
            this.destination = res.data;
            console.log('destination details', this.destination);
            this.cdr.markForCheck();
          }, 0);
        }
      });

      // get related tours by destination slug
      this._DataService.getTours({ destination_slug: slug }).subscribe((res) => {
        if (res && res.data) {
          setTimeout(() => {
            this.relatedTours = res.data.data;
            console.log('related tours', this.relatedTours);
            this.cdr.markForCheck();
          }, 0);
        }
      });
    });

    this.getRecentBlogs();
  }

  getRecentBlogs(): void {
    this._DataService.getBlogs().subscribe((res) => {
      if (res && res.data) {
        setTimeout(() => {
          this.recentBlogs = res.data.data;
          console.log('recent blogs', this.recentBlogs);
          this.cdr.markForCheck();
        }, 0);
      }
    });
  }

  galleryOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    autoplay: true,
    smartSpeed: 2500,
    margin: 10,
    dots: false,
    navText: ['<i class="fa fa-chevron-left"></i>', '<i class="fa fa-chevron-right"></i>'],
    responsive: {
      0: { items: 1 },
      586: { items: 2 },
      768: { items: 3 },
      // 992: { items: 4 },
    },
    nav: true,
  };

  newGalleryOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    autoplay: true,
    smartSpeed: 2500,
    margin: 10,
    dots: false,
    navText: ['<i class="fa fa-chevron-left"></i>', '<i class="fa fa-chevron-right"></i>'],
    responsive: {
      0: { items: 1 },
      586: { items: 2 },
      768: { items: 3 },
      992: { items: 5 },
    },
    nav: false,
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
    nav: true,
    navText: ['<i class="fa fa-chevron-left"></i>', '<i class="fa fa-chevron-right"></i>'],
    responsive: {
      0: { items: 1 },
      586: { items: 2 },
      768: { items: 3 },
      992: { items: 4 },
    },
  };

  blogsOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    nav: true,
    navText: ['<i class="fa fa-chevron-left"></i>', '<i class="fa fa-chevron-right"></i>'],
    responsive: {
      0: { items: 1 },
      586: { items: 2 },
      768: { items: 2 },
    },
    margin: 20,
    autoplay: true,
    smartSpeed: 2500,
  };
}
