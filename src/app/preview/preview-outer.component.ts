import { Component, Input, ViewChild } from '@angular/core';

// Workaround for untyped modules
declare var require: any;
//let { Backend } = require('react-dnd-touch-backend');
import Backend from 'react-dnd-html5-backend';
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
	<div #target style="height: 100px" class="preview-outer-wrapper">
		<jacob-preview [elements]="elements" [dndBackend]="backend" [dndRegistry]="registry"></jacob-preview>
	</div>
  `,
  styleUrls: ['./preview-outer-component.scss']
})
export class JacobPreviewOuterComponent {
  @Input() elements
  backend
  registry
  @ViewChild('target') target;
  constructor() {
	//let manager = new dnd.DragDropManager(m => new TouchBackend(m, { enableMouseEvents: true }));
	//this.registry = manager.getRegistry();
	//this.backend = manager.getBackend();
  var isDragging: any = false;
  var source: any = null;
  this.backend = new Backend({
    getActions: function() {
      return {
        beginDrag: function(s, o) {console.log('beginDrag'); source = s; isDragging = !!s.length; },
        publishDragSource: function() {
          console.log('publishDragSource');
          console.log(isDragging.clientOffset);
        },
        hover: function(_, x) {console.log('hover', x);},
        drop: function() {console.log('drop');},
        endDrag: function() {console.log('endDrag'); isDragging = false;}
      };
    },
    getMonitor: function() {
      return {
        isDragging: function() {return !!isDragging;},
        getSourceId: function() {return source;},
        didDrop: function() {console.log('didDrop', arguments); return false;},
        canDropOnTarget: function(){return false;},
        getItemType: function(){}
      }
    },
    getRegistry: function(){},
    getContext: function(){return {window: window}}
  }, { enableMouseEvents: true });
  this.backend.setup();
  }
  ngAfterViewInit() {
	let target = new TestTarget({name: 'target'});
  //var test = this.registry.addTarget('default', target);
  //console.log(test);
	this.backend.connectDropTarget('T0', this.target.nativeElement);
  }
}
