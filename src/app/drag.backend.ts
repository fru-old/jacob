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
  getDropTargets(source: s): t[];
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

  private static getRBushRectangleFromTarget(original: DropletTarget) {
    let {x, y, width, height} = original;
    return {
      original, minX: x, minY: y, maxX: x + width, maxY: y + height
    }
  }

  private static getRBushRectangleFromCoordinate({x, y}) {
    return DropletBackend.getRBushRectangleFromTarget({x, y, width: 0, height: 0});
  }

  private backend: any;
  private root: DropletRoot<t, s>;
  private engine: any;
  private registered: {[key: string]: s} = {};

  private dragging: boolean = false;
  private source: s;
  private begin: DropletCoordinate;
  private lastCoordinate: DropletCoordinate;

  private getMatchesAnSetBegin(current: DropletCoordinate): [t] {
      if (!current) current = this.lastCoordinate;
      this.lastCoordinate = current;
      if (!this.begin) this.begin = current;
      var coordinate = DropletBackend.getRBushRectangleFromCoordinate(current);
      var result = this.engine.search(coordinate);
      return result.map(({ original }) => original);
  }

  private getActions() {
    return {
      beginDrag: (source: string, o) => {
        this.source = this.registered[source];
        this.dragging = !!source.length;
        this.updateDropZones();
      },
      publishDragSource: () => {},
      hover: (_, param: {clientOffset: DropletCoordinate}) => {
        var matches = this.getMatchesAnSetBegin(param && param.clientOffset);
        this.root.highlight(this, this.source, {matches, begin: this.begin, current: this.lastCoordinate});
      },
      drop: (_, param: {clientOffset: DropletCoordinate}) => {
        var matches = this.getMatchesAnSetBegin(param && param.clientOffset);
        this.root.drop(this, this.source, {matches, begin: this.begin, current: this.lastCoordinate});
      },
      endDrag: () => {
        this.source = null;
        this.begin = null;
        this.dragging = false;
      }
    };
  }

  private getMonitor() {
    return {
      isDragging: () => { return this.dragging; },
      getSourceId: () => { return this.source && this.source.getId(); },
      didDrop: () => { return false; },
      canDropOnTarget: (_, test) => { return this.getMatchesAnSetBegin(null).length > 0 },
      getItemType: () => {}
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
    if (!context.__droplet) context.__droplet = {};
    return context.__droplet;
  }

  public static getHiddenProperty(name: string, context: any): any {
    return DropletBackend.getOrInitDropletProperty(context)[name];
  }

  public static setHiddenProperty(name: string, context: any, data: any) {
    var droplet = DropletBackend.getOrInitDropletProperty(context);
    if (droplet[name]) throw 'Only one ' + name + ' can be attached to the same context.';
    droplet[name] = data;
    return () => { droplet[name] = null; };
  }

  public static pushHiddenProperty(name: string, context: any, data: any) {
    var droplet = DropletBackend.getOrInitDropletProperty(context);
    if (!droplet[name]) droplet[name] = [];
    droplet[name].push(data);
    return () => { droplet[name] = droplet[name].filter(x => x === data); };
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

// Tree specific

export class TreeRectangleHelper {

  public static getExpanded({x, y, width, height, ...rest}, expansion: number = 0) {
    return {
      x: x - expansion,
      y: y - expansion,
      width:  width  + 2 * expansion,
      height: height + 2 * expansion,
      ...rest
    };
  }

  public static addIndentLevel({x, ...rest}, level: number, single: number) {
    return {x: x + level * single, ...rest };
  }

  public static getPartial(direction: number, {x, y, width, height, ...rest},
    expansion: number = 0, sideLeft: number = 0, sideRight: number = 0) {

    let isHorizontal = direction === 0 || direction === 2;
    if (isHorizontal) {

      if (sideLeft === 0) sideLeft = -expansion;
      if (sideRight === 0) sideRight = -expansion;

      height = height / 2;
      width -= sideLeft + sideRight;

      if (direction === 0) y -= expansion;
      if (direction === 2) y += height;

      return {x: x + sideLeft, y, width , height: height + expansion, ...rest};
    } else {

      let side = direction === 1 ? sideRight : sideLeft;
      if (direction === 1) x += width - sideRight;
      if (direction === 3) x -= expansion;

      return {x, y, width: side + expansion, height, ...rest};
    }
  }

  public static getFlatHighlight(direction: number, {x, y, width, height}, expansion: number = 0) {

    let isHorizontal = direction === 0 || direction === 2;
    if (isHorizontal) {

      if(direction === 0) y -= expansion;
      if(direction === 2) y += expansion + height;

      return { x, y, width, height: 0 };

    } else {

      if(direction === 1) x += expansion + width;
      if(direction === 3) x -= expansion;

      return { x, y, width: 0, height };
    }
  }
}

export class TreeIterateHelper {
  public static treeToList(items: any[], source: DropletSource, accessor: (any) => DropletSource) {
    let results = [];
    TreeIterateHelper.iterator(items, source, 0, results, [], null);
    return results
      .map((collection, i) => collection.getTargetAreas(source))
      .reduce((a, b) => a.concat(b));
  }

  //DropletBackend.getHiddenProperty(TreeSource.SOURCE,

  private static iterator(items, source, level, results, parents, previous) {

    for(let item of items) {

      let collection = new TreeTargetCollection();

      collection.level = level;
      collection.items = item.length ? item : [item];

      collection.parents = parents;
      if (previous) {
        collection.prev = previous;
        previous.next = collection;
      }
      results.push(collection);
      previous = collection;

      if (item.children && !isSource) {
        var newParents = parents.concat([collection]);
        previous = TreeIterateHelper.iterator(
          item.children, source, level + 1, results, newParents, previous
        );
      }
    }
    return previous;
  }
}

export class TreeTransformations {
  // TODO transformations
}

export class TreeTargetCollection {
  level: number;
  items: any[];

  prev: TreeTargetCollection;
  next: TreeTargetCollection;
  parents: TreeTargetCollection[];

  public getTargetAreas(source: TreeSource): TreeTarget[]  {
    // TODO areas

    return null;
  }
}

export class TreeTarget implements DropletTarget {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(target) {
    if (!target) return;

    this.x = target.x;
    this.y = target.y;
    this.width = target.width;
    this.height = target.height;
  }

  public setBounds(bounds: any) {
    this.x = bounds.left;
    this.y = bounds.top;
    this.width = bounds.width;
    this.height = bounds.height;
  }

  public highlight(position: DropletPosition<TreeTarget>) {
    return this;
  }

  public drop(pos)
}
