import { TouchBackend } from 'react-dnd-touch-backend';
import HtmlBackend from 'react-dnd-html5-backend';
import rbush from 'rbush';
import { Target } from './_interfaces/target';
import { Coordinate } from './_interfaces/geometry';
import { DropletRoot, DropletSource, DropletPreview } from './_interfaces/droplet';
import { Generator } from './generator-abstract';
import { DefaultGenerator } from './generator-default';
import { DragRegistry } from './drag-registry';

export class DragBackend {

  private static getRBushRectangleFromTarget(original: Target) {
    let {x, y, width, height} = original.area;
    return {original, minX: x, maxX: x + width, minY: y, maxY: y + height}
  }

  private static getRBushRectangleFromCoordinate({x, y}: Coordinate) {
    return {minX: x, maxX: x, minY: y, maxY: y};
  }

  private getMatchesAnSetBegin(current: Coordinate): Target[] {
      if (!current) current = this.lastCoordinate;
      this.lastCoordinate = current;
      if (!this.begin) this.begin = current;
      let coordinate = DragBackend.getRBushRectangleFromCoordinate(current);
      return this.engine.search(coordinate).map(x => x.original);
  }

  private engine: any = rbush();
  private backend: HtmlBackend;
  private isDragging: boolean = false;
  private source: DropletSource;
  private begin: Coordinate;
  private lastCoordinate: Coordinate;
  generator: Generator;

  constructor(private root: DropletRoot, public registry: DragRegistry) {
    this.backend = this.getBackend();
    this.backend.connectDropTarget('root', root.getNativeElement());
  }

  private getBackend() {
    let options = {
      getActions: () => this.getActions(),
      getMonitor: () => this.getMonitor(),
      getContext: () => ({ window }),
      getRegistry: () => ({ addSource: () => {} })
    };
    let backend = new HtmlBackend(options, { enableMouseEvents: true });
    backend.setup();
    return backend;
  }

  private getActions() {
    let undo;
    return {
      beginDrag: (source: string, o) => {
        this.source = this.registry.getRegisteredSource(source);
        undo = this.registry.setSelected(this, this.source, true);
        this.isDragging = !!source.length;
        this.updateDropZones();
      },
      publishDragSource: () => {},
      hover: (_, param: {clientOffset: Coordinate}) => {
        var matches = this.getMatchesAnSetBegin(param && param.clientOffset);
        this.root.setHover(this.generator.hover(matches, this.begin, this.lastCoordinate));
      },
      drop: (_, param: {clientOffset: Coordinate}) => {
        var matches = this.getMatchesAnSetBegin(param && param.clientOffset);
        this.generator.drop(matches, this.begin, this.lastCoordinate);
      },
      endDrag: () => {
        if (undo) undo();
        this.source = null;
        this.begin = null;
        this.isDragging = false;
      }
    };
  }

  private getMonitor() {
    return {
      isDragging: () => { return this.isDragging; },
      getSourceId: () => { return this.source && this.registry.getId(this.source.context); },
      didDrop: () => { return false; },
      canDropOnTarget: (_, test) => { return this.getMatchesAnSetBegin(null).length > 0 },
      getItemType: () => {}
    }
  }

  connectSourceAndPreview(id, source: DropletSource, preview: DropletPreview) {
    let undoSource = this.backend.connectDragSource(id, source.getNativeElement());
    let undoPreview = this.backend.connectDragPreview(id, preview.getNativeElement());
    return function () {
      undoSource();
      undoPreview();
    }
  }

  updateDropZones() {
    this.generator = new DefaultGenerator(this.root.getNativeElement(), this.root.context, {}, this.registry);
    this.engine.clear();
    for(let target of this.generator.tree.generateTargets()) {
      this.engine.insert(DragBackend.getRBushRectangleFromTarget(target));
    }
  }

  teardown() {
    if(this.backend) this.backend.teardown();
    if(this.engine) this.engine.clear();
  }
}
