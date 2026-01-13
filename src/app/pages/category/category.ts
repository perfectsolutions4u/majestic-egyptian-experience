import { ChangeDetectorRef, Component } from '@angular/core';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { TourCartComponent } from '../../shared/components/tour-cart/tour-cart.component';
import { ActivatedRoute } from '@angular/router';
import { Itour } from '../../core/interfaces/itour';
import { DataService } from '../../services/data.service';
import { OnInit } from '@angular/core';
import { ICategory } from '../../core/interfaces/icategory';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-category',
  imports: [BannerComponent, TourCartComponent],
  templateUrl: './category.html',
  styleUrl: './category.scss',
})
export class Category implements OnInit {
  constructor(
    private _DataService: DataService,
    private _ActivatedRoute: ActivatedRoute,
    private _cdr: ChangeDetectorRef
  ) {}

  tours: Itour[] = [];
  category: ICategory = {} as ICategory;
  backgroundImage: string = '';
  ngOnInit(): void {
    this._ActivatedRoute.params.subscribe((params) => {
      let slug = params['slug'];
      console.log('slug', slug);
      this._DataService.getCategoryBySlug(slug).subscribe((res) => {
        // console.log('res', res);
        setTimeout(() => {
          this.category = res.data;
          console.log('category', this.category);
          this._cdr.markForCheck();
        }, 0);
      });
      this._DataService.getTours({ category_slug: slug }).subscribe((res) => {
        // console.log('res', res);
        if (res && res.data) {
          setTimeout(() => {
            this.tours = res.data.data;
            console.log('tours', this.tours);
            this._cdr.markForCheck();
          }, 0);
        }
      });
    });
  }
}
