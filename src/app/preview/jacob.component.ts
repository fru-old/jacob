import { InputElement } from '../elements/input.element';
import { Component, Input } from '@angular/core';



@Component({
  selector: 'jacob',
  template: `
    <jacob-element *ngFor="let element of elements" [element]=element></jacob-element>
  `
})
export class JacobComponent {
  @Input() elements;
}
