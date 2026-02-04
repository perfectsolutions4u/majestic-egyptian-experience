import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent implements OnChanges {
  @Input() current_page: number = 1;
  @Input() total: number = 0;
  @Input() from: number = 0;
  @Input() to: number = 0;
  @Input() per_page: number = 15;
  @Output() pageChange = new EventEmitter<number>();

  // ngx-pagination properties
  p: number = 1; // current page for ngx-pagination
  itemsPerPage: number = 15;
  totalItems: number = 0;
  paginationId: string = 'server-pagination';

  // Dummy array for ngx-pagination (required for server-side pagination)
  dummyArray: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['current_page'] || changes['total'] || changes['per_page']) {
      this.p = this.current_page || 1;
      this.itemsPerPage = this.per_page || 15;
      this.totalItems = this.total || 0;
      // Create dummy array for ngx-pagination
      this.dummyArray = new Array(this.totalItems);
    }
  }

  onPageChange(page: number): void {
    if (page !== this.current_page) {
      this.p = page;
      this.pageChange.emit(page);
    }
  }
}
