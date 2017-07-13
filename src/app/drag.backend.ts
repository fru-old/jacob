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
  priority:  number;
}

export interface DropletPosition <t extends DropletTarget> {
  matches: t[],
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
      original, minX: x, maxX: x + width, minY: y, maxY: y + height
    }
  }

  private static getRBushRectangleFromCoordinate({x, y}: DropletCoordinate) {
    return {minX: x, maxX: x, minY: y, maxY: y};
  }

  private backend: any;
  private root: DropletRoot<t, s>;
  private engine: any;
  private registered: {[key: string]: s} = {};

  private dragging: boolean = false;
  private source: s;
  private begin: DropletCoordinate;
  private lastCoordinate: DropletCoordinate;

  private static getHighestPriority(result) {
    let highestResults = [];
    let highestPriority = 0;
    for (let r of result) {
      if (r.priority > highestPriority) {
        highestResults = [r];
        highestPriority = r.priority;
      } else if (r.priority === highestPriority) {
        highestResults.push(r);
      }
    }
    return highestResults;
  }

  private getMatchesAnSetBegin(current: DropletCoordinate): t[] {
      if (!current) current = this.lastCoordinate;
      this.lastCoordinate = current;
      if (!this.begin) this.begin = current;
      let coordinate = DropletBackend.getRBushRectangleFromCoordinate(current);
      return DropletBackend.getHighestPriority(this.engine.search(coordinate));
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

// Tree geometry helper

export class TreeRectangleHelper {

  public expansion: number = 0;
  public levelWidth: number = 0;

  public getBoundingClientRect(nativeElement) {
    let bounds = nativeElement.getBoundingClientRect();
    return {x: bounds.left, y: bounds.top, width: bounds.width, height: bounds.height};
  }

  public getExpanded({x, y, width, height, ...rest}, useExpansion: boolean) {
    let expansion = useExpansion ? this.expansion : 0;

    return {
      x: x - expansion,
      y: y - expansion,
      width:  width  + 2 * expansion,
      height: height + 2 * expansion,
      ...rest
    };
  }

  public getSpaceBeforeFirst({x, width, ...rest}, level: number) {
    return {x: x - level * this.levelWidth, width: level * this.levelWidth, ...rest };
  }

  public getPartial(direction: number, {x, y, width, height, ...rest},
    useExpansion: boolean, sideLeft: number = 0, sideRight: number = 0) {

    let expansion = useExpansion ? this.expansion : 0;

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

  public getFlatHighlight(direction: number, {x, y, width, height}, useExpansion: boolean) {

    let expansion = useExpansion ? this.expansion : 0;

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

// tree state helper

export class TreeState {

  public static readonly SOURCE = 'source';
  public static readonly PREVIEW = 'preview';

  public readonly rectangleHelper = new TreeRectangleHelper();
  public collectionType = () => new TreeTargetCollection(this);
  public collections: TreeTargetCollection[] = [];
  public sourceCollection: TreeTargetCollection;

  public getTargetAreas() {
    return this.collections
      .map((collection, i) => collection.getTargetAreas(this.source))
      .reduce((a, b) => a.concat(b));
  }

  public constructor(levelWidth: number, distanceBetween: number, items: any[], private source: DropletSource) {
    this.rectangleHelper.levelWidth = levelWidth;
    this.rectangleHelper.expansion = distanceBetween / 2;
    this.flatten(items, source, 0, this.collections, null, null);
  }

  public static getRegisteredSource(item) {
    return DropletBackend.getHiddenProperty(TreeState.SOURCE, item);
  }

  public static getRegisteredPreview(item) {
    return DropletBackend.getHiddenProperty(TreeState.PREVIEW, item);
  }

  private flatten(items, source, level, results, parent, previous) {
    items.forEach((item, index) => {
      let collection = this.collectionType();

      collection.parent = parent;
      collection.level = level;
      collection.index = index;
      collection.context = item;

      if (previous) {
        collection.prev = previous;
        previous.next = collection;
      }
      results.push(collection);
      previous = collection;

      collection.hasChildren = item.children && item.children.length > 0;
      collection.hasSourceAt = this.getIndexOfSource(collection, source);

      if(collection.hasSourceAt !== -1) {
        this.sourceCollection = collection;
      }

      if (collection.hasChildren && !collection.isSingleAndSource()) {
        previous = this.flatten(item.children, source, level + 1, results, collection, previous);
      }
    });
    return previous;
  }

  private getIndexOfSource(collection, source) {
    let sources = collection.getNormalizedContext().map((n) => TreeState.getRegisteredSource(n));
    return sources.indexOf(source);
  }
}

export class TreeTargetCollection {
  level: number;
  index: number;

  // can not be the empty array
  context: any;

  hasChildren: boolean;
  hasSourceAt: number = -1;

  constructor(public state: TreeState) {}

  isSingleAndSource () {
    return this.context.length === 1 && this.hasSourceAt > -1;
  }

  getNormalizedContext() {
    return this.context.length >= 0 ? this.context : [this.context]
  }

  prev: TreeTargetCollection;
  next: TreeTargetCollection;
  parent: TreeTargetCollection;

  public getTargetAreas(source: DropletSource): TreeTarget[]  {
    let areas = [];
    let normalized = this.getNormalizedContext();
    let first = normalized[0];

    if (this.isSingleAndSource()) {
      let preview = TreeState.getRegisteredSource(first);
      let beforeFirst = this.state.rectangleHelper.getSpaceBeforeFirst(first, preview.level);
      areas.push(new TreeTarget(beforeFirst));
      areas.push(new TreeTarget(preview));
    } else {
      // Before first item

      // Areas in items
      for (let i = 0; i < normalized.length; i++) {
        let item = normalized[i];


      }
    }

    return areas;
  }
}

export class TreeTransformationHelper {
  // detach
  // insert(direction, relativeCollection, relativeIndex)
}

export class TreeTarget implements DropletTarget {
  x: number;
  y: number;
  width: number;
  height: number;
  priority: number = 0;

  direction: number = null;
  index: number;
  collection: TreeTargetCollection;

  constructor(target) {
    if (!target) return;

    this.x = target.x;
    this.y = target.y;
    this.width = target.width;
    this.height = target.height;
    this.priority = target.priority || 0;
  }

  public highlight(position: DropletPosition<TreeTarget>) {
    return this;
  }

  public drop(position: DropletPosition<TreeTarget>) {
    if (this.direction === null) return;
  }
}
