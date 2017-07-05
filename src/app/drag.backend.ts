import { TouchBackend } from 'react-dnd-touch-backend';
import HtmlBackend from 'react-dnd-html5-backend';
import rbush from 'rbush';

export interface DropletCoordinate {
  x: number;
  y: number;
}

export interface DropletTarget {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DropletPosition <t extends DropletTarget> {
  matches: [t],
  begin: DropletCoordinate,
  current: DropletCoordinate
}

interface DropletRoot <t extends DropletTarget, s extends DropletSource> {
  getNativeElement(): HTMLElement;
  getDropTargets(): [t];
  highlight(backend: DropletBackend<t, s>, source: s, position: DropletPosition<t>)
  drop(backend: DropletBackend<t, s>, source: s, position: DropletPosition<t>)
}

interface DropletSource {
  getNativeElement(): HTMLElement;
  getId(): string;
}

interface DropletPreview {
  getNativeElement(): HTMLElement;
}

export class DropletBackend <t extends DropletTarget, s extends DropletSource> {

  private static getRBushRectangleFromTarget({x, y, width, height}) {
    return {
      minX: x, minY: y, maxX: x + width, maxY: y + height
    }
  }

  private static getRBushRectangleFromCoordinate({x, y}) {
    return DropletBackend.getRBushRectangleFromTarget({x, y, width: 0, height: 0});
  }

  private backend: HtmlBackend;
  private root: DropletRoot<t, s>;
  private engine: any;
  private registered: {[key: string]: s} = {};

  private isDragging: boolean = false;
  private source: s;
  private begin: DropletCoordinate;

  private getActions() {
    function getMatchesAnSetBegin(current: DropletCoordinate): [t] {
        if (!this.begin) this.begin = current;
        var coordinate = DropletBackend.getRBushRectangleFromCoordinate(current);
        return this.engine.search(coordinate);
    }

    return {
      beginDrag: function(source: string, o) {
        this.source = this.registered[source];
        this.isDragging = !!source.length;
        this.updateDropZones();
      },
      publishDragSource: function() {},
      hover: function(_, param: {clientOffset: DropletCoordinate}) {
        var matches = this.getMatchesAnSetBegin(param.clientOffset);
        this.root.highlight(this, matches, this.begin, param.clientOffset);
      },
      drop: function(_, param: {clientOffset: DropletCoordinate}) {
        var matches = this.getMatchesAnSetBegin(param.clientOffset);
        this.root.drop(this, matches, this.begin, param.clientOffset);
      },
      endDrag: function() {
        this.source = null;
        this.begin = null;
        this.isDragging = false;
      }
    };
  }

  private getMonitor() {
    return {
      isDragging: function() { return this.isDragging; },
      getSourceId: function() { return this.source && this.source.getId(); },
      didDrop: function() { return false; },
      canDropOnTarget: function(){ return false; },
      getItemType: function(){}
    }
  }

  private getBackend() {
    let backend = new HtmlBackend({
      getActions: () => this.getActions(),
      getMonitor: () => this.getMonitor(),
      getRegistry: function () { return { addSource: function() {} } },
      getContext: function() { return { window: window } }
    }, { enableMouseEvents: true });
    backend.setup();
    return backend;
  }

  public static setPreview(context: any, data: DropletPreview) {
    // TODO
    return function undo() {};
  }

  public static getPreview(context: any): DropletPreview {
    // TODO
    return null;
  }

  public static addSource(context: any, data: DropletSource) {
    // TODO
    return function undo() {};
  }

  public static getSources(context: any): [DropletSource] {
    // TODO
    return null;
  }

  public constructor(root: DropletRoot<t, s>) {
    this.engine = rbush();
    this.root = root;
    this.backend = this.getBackend();
    this.backend.connectDropTarget('root', root.getNativeElement());
  }

  public connect(source: s, context: any) {
    let preview = DropletBackend.getPreview(context).getNativeElement();
    let element = source.getNativeElement();
    let undoSource = this.backend.connectDragSource(source.getId(), element);
    let undoPreview = this.backend.connectDragPreview(source.getId(), preview || element);

    this.registered[source.getId()] = source;
    return () => {
      delete this.registered[source.getId()];
      undoSource();
      undoPreview();
    };
  }

  public updateDropZones() {
    this.engine.clear();
    for(let target of this.root.getDropTargets()) {
      this.engine.insert(DropletBackend.getRBushRectangleFromTarget(target));
    }
  }

  public teardown() {
    if(this.backend) this.backend.teardown();
    if(this.engine) this.engine.clear();
  }
}
