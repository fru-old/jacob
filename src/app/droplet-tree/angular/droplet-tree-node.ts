import { Component, Input, ElementRef, Inject, SimpleChange } from '@angular/core';
import { OnChanges, OnDestroy } from '@angular/core';
import { DropletSource } from '../_interfaces/droplet';
import { DropletTreeRoot } from './droplet-tree-root';

@Component({
  selector: '[droplet-tree-node]',
  template: `
    <ng-content></ng-content>
  `
})
export class DropletTreeNode implements DropletSource, OnChanges, OnDestroy {

  @Input() context: any;
  @Input() root: DropletTreeRoot;

  private undo: any;

  constructor (@Inject(ElementRef) private reference: ElementRef) {}

  getNativeElement() {
    return this.reference.nativeElement;
  }

  ngOnDestroy () {
    if(this.undo) this.undo();
  }

  ngOnChanges(changes: {[ propName: string]: SimpleChange}) {
    if(this.undo) this.undo();
    this.undo = this.root.backend.registry.registerSource(this.root.backend, this);
  }
}
