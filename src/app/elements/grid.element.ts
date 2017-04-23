import { Component, Input } from '@angular/core';

@Component({
  template: `
    <div class="row">
      <div class="col-sm" *ngFor="let current of element.elements">
       <jacob-element [element]=current></jacob-element>
      </div>
    </div>
  `
})
export class GridElement {
  @Input() element;
}
