//let { Backend } = require('react-dnd-touch-backend');
import Backend from 'react-dnd-html5-backend';

export class BackendFacade {

  private backend: Backend;

  constructor () {
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
      getRegistry: function(){
        return {
          addSource: function() {}
        }
      },
      getContext: function(){return {window: window}}
    }, { enableMouseEvents: true });
    this.backend.setup();
  }
  registerRoot (root: any) {
    this.backend.connectDropTarget('root', root);
  }
  registerSource (source: any, id: number, preview: any) {
    let undoSource, undoPreview;
    undoSource = this.backend.connectDragSource(id, source);
    undoPreview = this.backend.connectDragPreview(id, preview || source);

    return function () {
      undoSource();
      undoPreview();
    };
  }
}
