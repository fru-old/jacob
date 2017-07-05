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

export interface DropletRoot <t extends DropletTarget, s extends DropletSource> {
  getNativeElement(): HTMLElement;
  getDropTargets(source: s): [t];
  highlight(backend: DropletBackend<t, s>, source: s, position: DropletPosition<t>)
  drop(backend: DropletBackend<t, s>, source: s, position: DropletPosition<t>)
}

export interface DropletSource {
  getNativeElement(): HTMLElement;
  getId(): string;
}

export interface DropletPreview {
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

  private static idCounter = 1;
  public static getUniqueId() {
    return DropletBackend.idCounter++;
  }

  private static getOrInitDropletProperty(context: any) {
    if (!context.__droplet) context.__droplet = { sources: [] };
    return context.__droplet;
  }

  public static setPreview(context: any, data: DropletPreview) {
    var droplet = DropletBackend.getOrInitDropletProperty(context);
    if (droplet.preview) throw 'Only one preview can be attached to the same object.';
    droplet.preview = data;
    return function undo() {
      droplet.preview = null;
    };
  }

  public static getPreview(context: any): DropletPreview {
    var droplet = DropletBackend.getOrInitDropletProperty(context);
    return droplet.preview;
  }

  public static addSource(context: any, data: DropletSource) {
    var droplet = DropletBackend.getOrInitDropletProperty(context);
    droplet.sources.push(data);
    return function undo() {
      droplet.sources = droplet.sources.filter(x => x === data);
    };
  }

  public static getSources(context: any): [DropletSource] {
    var droplet = DropletBackend.getOrInitDropletProperty(context);
    return droplet.sources;
  }

  public constructor(root: DropletRoot<t, s>) {
    this.engine = rbush();
    this.root = root;
    this.backend = this.getBackend();
    this.backend.connectDropTarget('root', root.getNativeElement());
  }

  public connect(source: s, preview: DropletPreview) {
    let sourceElement = source.getNativeElement();
    let previewElement = (preview && preview.getNativeElement()) || sourceElement;
    let undoSource = this.backend.connectDragSource(source.getId(), sourceElement);
    let undoPreview = this.backend.connectDragPreview(source.getId(), previewElement);

    this.registered[source.getId()] = source;
    return () => {
      delete this.registered[source.getId()];
      undoSource();
      undoPreview();
    };
  }

  public updateDropZones() {
    this.engine.clear();
    for(let target of this.root.getDropTargets(this.source)) {
      this.engine.insert(DropletBackend.getRBushRectangleFromTarget(target));
    }
  }

  public teardown() {
    if(this.backend) this.backend.teardown();
    if(this.engine) this.engine.clear();
  }
}
