import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-blog-category',
  imports: [],
  templateUrl: './blog-category.html',
  styleUrl: './blog-category.scss',
})
export class BlogCategory implements OnInit {
  constructor(
    private _DataService: DataService,
    private _ActivatedRoute: ActivatedRoute,
    private _cdr: ChangeDetectorRef
  ) {}

  blogCategory: any = {};

  ngOnInit(): void {
    this._ActivatedRoute.params.subscribe((params) => {
      let id = params['id'];
      console.log('id', id);

      this._DataService.getBlogCategoriesDetails(id).subscribe((res) => {
        console.log('res', res);
        if (res && res.data) {
          setTimeout(() => {
            this.blogCategory = res.data;
            console.log('blogCategory', this.blogCategory);
            this._cdr.markForCheck();
          }, 0);
        }
      });
    });
  }
}
