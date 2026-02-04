import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../../services/data.service';
import { CommonModule } from '@angular/common';
import { Itour } from '../../../core/interfaces/itour';

@Component({
  selector: 'app-tour-cart',
  standalone: true,
  imports: [RouterLink, CommonModule, TranslateModule],
  templateUrl: './tour-cart.component.html',
  styleUrl: './tour-cart.component.scss',
})
export class TourCartComponent implements OnInit {
  constructor(
    private _DataService: DataService,
    private toaster: ToastrService,
    private _Router: Router,
    public translate: TranslateService
  ) {}

  @Input() layoutType: 'grid' | 'list' = 'grid';
  @Input() tour?: Itour;

  favs: any[] = [];
  favouriteIds: number[] = [];
  alltours: any[] = [];

  ngOnInit(): void {
    // قراءة الـ favouriteIds من localStorage عند تحميل الـ component
    this.loadFavouritesFromStorage();
  }

  /**
   * قراءة الـ favouriteIds من localStorage
   * يتم استدعاء هذه الدالة عند تحميل الـ component
   */
  private loadFavouritesFromStorage(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const storedFavs = localStorage.getItem('favouriteIds');
      this.favouriteIds = storedFavs ? JSON.parse(storedFavs) : [];
    }
  }

  /**
   * حفظ الـ favouriteIds في localStorage
   * يتم الإضافة على القيم الموجودة وليس استبدالها
   */
  private saveFavouritesToStorage(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // قراءة القيم الموجودة أولاً من localStorage
      const storedFavs = localStorage.getItem('favouriteIds');
      const existingIds: number[] = storedFavs ? JSON.parse(storedFavs) : [];

      // دمج القيم الموجودة مع القيم الجديدة (بدون تكرار)
      const mergedIds = [...new Set([...existingIds, ...this.favouriteIds])];

      // حفظ القيم المدمجة
      localStorage.setItem('favouriteIds', JSON.stringify(mergedIds));

      // تحديث المتغير المحلي
      this.favouriteIds = mergedIds;
    }
  }

  addFav(id: number, event: Event): void {
    event.stopPropagation();
    if (!localStorage.getItem('accessToken')) {
      this.toaster.error(this.translate.instant('common.youMustHaveAccount'));
      this._Router.navigate(['/login']);
      return;
    }

    // قراءة القيم الحالية من localStorage للتأكد من التزامن
    this.loadFavouritesFromStorage();

    // Optimistic UI update: toggle immediately before API call
    const index = this.favouriteIds.indexOf(id);
    const wasInFavorites = index > -1;

    if (wasInFavorites) {
      // إزالة من المفضلة
      this.favouriteIds.splice(index, 1);
      localStorage.setItem('favouriteIds', JSON.stringify(this.favouriteIds));
    } else {
      // إضافة للمفضلة - التأكد من عدم التكرار
      if (!this.favouriteIds.includes(id)) {
        this.favouriteIds.push(id);
      }
      // حفظ مع الإضافة على القيم الموجودة
      this.saveFavouritesToStorage();
    }

    // Make API call
    this._DataService.toggleWishlist(id).subscribe({
      next: (response) => {
        this.favs = response;
        // Success - the optimistic update was correct
      },
      error: (err) => {
        // Revert the optimistic update on error
        if (wasInFavorites) {
          // كان موجود وحاولنا نشيله، نرجعه تاني
          if (!this.favouriteIds.includes(id)) {
            this.favouriteIds.push(id);
          }
          this.saveFavouritesToStorage();
        } else {
          // كان مش موجود وحاولنا نضيفه، نشيله تاني
          const idx = this.favouriteIds.indexOf(id);
          if (idx > -1) {
            this.favouriteIds.splice(idx, 1);
          }
          localStorage.setItem('favouriteIds', JSON.stringify(this.favouriteIds));
        }
        this.toaster.error(err.error.message);
      },
    });
  }
}
