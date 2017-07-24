import { Component, Input, SimpleChange } from '@angular/core';
import { OnChanges, OnDestroy } from '@angular/core';
import { DropletRoot, DropletSource, DropletPreview } from '../_interfaces/droplet';

Component({
  selector: 'droplet-tree-inner',
  template: `<ng-content></ng-content>`
})
export class DropletTreeInner implements OnChanges, OnDestroy {
  @Input() preview: DropletPreview;
  @Input() source: DropletSource;
  @Input() root: DropletRoot;

  private undo: any;

  ngOnDestroy () {
    if(this.undo) this.undo();
  }

  ngOnChanges(changes: {[ propName: string]: SimpleChange}) {
    if(this.undo) this.undo();
    this.undo = this.root.backend.connect(this.source, this.preview);
  }
}
