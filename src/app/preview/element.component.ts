import { InputElement } from '../elements/input.element';
import { Component, Input, AfterViewInit, OnInit, ComponentFactoryResolver, ViewContainerRef, ViewChild } from '@angular/core';
import { BoundingBoxElement, BoundingBox } from './bounding-box.abstract';
import { DomSanitizer  } from '@angular/platform-browser';

@Component({
  selector: 'jacob-element',
  template: `
    <div #wrapper>
      <div #inner style="position: relative;">
        <ng-template #container></ng-template>
      </div>
    </div>
  `
})
export class JacobElementComponent implements OnInit, BoundingBoxElement {
  constructor(private componentFactoryResolver: ComponentFactoryResolver, private sanitizer: DomSanitizer){}

  @Input() element;
  @ViewChild('container', { read: ViewContainerRef }) container;
  @ViewChild('wrapper') wrapper;
  @ViewChild('inner') inner;

  ngOnInit() {
    let factory = this.componentFactoryResolver.resolveComponentFactory(this.element.type);
    this.container.clear();
    var component = this.container.createComponent(factory);
    component.instance.element = this.element;
    this.element._jacob = { element: this };
  }

  updateRelativePosition() {
    let offset = this.element._jacob && this.element._jacob.offset;
    this.inner.nativeElement.style.left = offset ? (offset.x) + 'px' : 0;
    this.inner.nativeElement.style.top = offset ? (offset.y) + 'px' : 0;
  }

  getBoundingBox(): BoundingBox {
    return BoundingBoxElement.getBoundingBox(this.wrapper.nativeElement);
  }
}
