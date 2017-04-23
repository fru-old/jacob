import { InputElement } from '../elements/input.element';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'jacob-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class JacobPreviewComponent {
  @Input() elements
}
