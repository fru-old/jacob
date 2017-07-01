import { InputElement } from '../elements/input.element';
import { Component, Input, ViewChildren } from '@angular/core';

class TestSource {
  constructor(private item: any) {}

  beginDrag() {
	console.log('beginDrag', arguments);
    return this.item;
  }

  endDrag(monitor) {
	console.log('endDrag', arguments);
    console.log(monitor.getDropResult());
  }

  canDrag() {
	console.log('canDrag', arguments);
    return true;
  }

  isDragging(monitor, handle) {
	console.log('isDragging', arguments);
    return handle === monitor.getSourceId();
  }
}

var xyz = false;
@Component({
  selector: 'jacob-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class JacobPreviewComponent {
  @Input() elements
  @Input() dndBackend
  @Input() dndRegistry

  @ViewChildren('elementView') elementViews

  ngAfterViewChecked() {
    if(xyz) return;

	for(var i = 0; i < this.elementViews._results.length; i++) {
		var  jacob = this.elements[i]._jacob;
		var native = this.elementViews._results[i].nativeElement;
		if (jacob.registered !== native) {
			//jacob.registered = native;
			//console.log(native);
			//let source = new TestSource({name: 'sources ???'});
      console.log(native);
			let undoSource = this.dndBackend.connectDragSource('S'+i, native);
      this.dndBackend.connectDragPreview('S'+i, document.body);
      xyz = true;
		}
	}
  }
}
