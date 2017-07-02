//let { Backend } = require('react-dnd-touch-backend');
import Backend from 'react-dnd-html5-backend';
import rbush from 'rbush';

export class BackendFacade {

  private backend: Backend;
  private getDropTargets: any;
  private highlight: any
  private engine: any;

  constructor () {
    this.engine = rbush();
    var isDragging: any = false;
    var source: any = null;
    var self = this;

    this.backend = new Backend({
      getActions: function() {
        return {
          beginDrag: function(s, o) {
            source = s;
            isDragging = !!s.length;
            self.updateDropZones();
          },
          publishDragSource: function() {},
          hover: function(_, {clientOffset}) {
            var matches = self.engine.search({
              minX: clientOffset.x,
              maxX: clientOffset.x,
              minY: clientOffset.y,
              maxY: clientOffset.y
            });
            console.log(matches);

            self.highlight.x = 10;
            self.highlight.y = 10;
            self.highlight.width = 10;
            self.highlight.height = 10;
          },
          drop: function(_, {clientOffset}) { console.log('drop', clientOffset); },
          endDrag: function() { isDragging = false; }
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
  registerRoot (root: any, getDropTargets: any, highlight: any) {
    this.getDropTargets = getDropTargets;
    this.highlight = highlight;
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
  updateDropZones () {
    this.engine.clear();
    for(let dropzone of this.getDropTargets()) {
      this.engine.insert(dropzone.position);
    }
  }
}
