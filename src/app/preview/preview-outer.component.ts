import { Component, Input, ViewChild } from '@angular/core';

// Workaround for untyped modules
declare var require: any;
let { TouchBackend } = require('react-dnd-touch-backend');
let dnd = require('dnd-core');


class TestTarget {
  constructor(private result: any) {}

  canDrop() {
	console.log('canDrop', arguments);
    return true;
  }

  hover() { 
	console.log('hover', arguments);
  }

  drop() { 
	console.log('drop', arguments);
	return this.result;
  }
}


@Component({
  selector: 'jacob-preview-outer',
  template: `
	<div #target style="height: 800px">
		<jacob-preview [elements]="elements" [dndBackend]="backend" [dndRegistry]="registry"></jacob-preview>
	</div>
  `
})
export class JacobPreviewOuterComponent {
  @Input() elements
  backend
  registry
  @ViewChild('target') target;
  constructor() {
	let manager = new dnd.DragDropManager(m => new TouchBackend(m, { enableMouseEvents: true }));
	this.registry = manager.getRegistry();
	this.backend = manager.getBackend();
  }
  ngAfterViewInit() {
	let target = new TestTarget({name: 'target'});
	console.log(this.target.nativeElement);
	this.backend.connectDropTarget(this.registry.addTarget('default', target), this.target.nativeElement);
  }
}
