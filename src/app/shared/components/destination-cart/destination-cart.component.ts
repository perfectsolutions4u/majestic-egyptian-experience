import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IDestination } from '../../../core/interfaces/idestination';

@Component({
  selector: 'app-destination-cart',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './destination-cart.component.html',
  styleUrl: './destination-cart.component.scss',
})
export class DestinationCartComponent {
  @Input() destination?: IDestination;

  ngOnInit(): void {
    // console.log('destination-cart component -- destination -- ', this.destination);
  }
}
