import { BoundingBox, Coordinate, Direction } from './_interfaces/geometry';
import { Target } from './_interfaces/target';
import { FlatTreeContainer } from './flat-tree-container';
import { FlatTreeTransformer } from './flat-tree-transformer';
import { HiddenDataHelper } from './hidden-data-helper';
import { Generator } from './generator-abstract';

export class DefaultGenerator extends Generator {

  // TODO fix this options cant be changed
  public options = {
    levelWidth: 30,
    spacing: 8,
    childProperty: 'children',
    multiProperty: 'inline'
  };

  constructor (private root: HTMLElement, private raw: any[]) { super(); }
  readonly tree: FlatTreeContainer = new FlatTreeContainer(this, this.raw);

  private getProperty(node, property, create?: boolean) {
    if (create && !node[property]) node[property] = [];
    return node[property];
  }

  getChildren(node, create?: boolean): object[] {
    return this.getProperty(node, this.options.childProperty, create);
  }

  getMultiRow(node, create?: boolean): object[] {
    return this.getProperty(node, this.options.multiProperty, create);
  }

  getLevelWidth(): number { return this.options.levelWidth; }

  isSelected(node): boolean {
    return HiddenDataHelper.getHidden(HiddenDataHelper.IS_SELECTED, node);
  }

  private getElementRect(node): BoundingBox {
    let element;
    if (this.isSelected(node)) {
      element = HiddenDataHelper.getHidden(HiddenDataHelper.PREVIEW, node);
    } else {
      element = HiddenDataHelper.getHidden(HiddenDataHelper.SOURCE, node);
    }
    let box = element.reference.nativeElement.getBoundingClientRect();
    let relative = this.root.getBoundingClientRect();
    return {
      x: box.left - relative.left,
      y: box.top  - relative.top,
      width:  box.width,
      height: box.height
    };
  }

  expand(box: BoundingBox) {
    box.x -= this.options.spacing;
    box.y -= this.options.spacing;
    box.height += 2 * this.options.spacing;
    box.width  += 2 * this.options.spacing;
    return box;
  }

  getTargetBox(node, direction: Direction, before: boolean): BoundingBox {
    let box = this.getElementRect(node);
    let halfHeight = Math.ceil(box.height / 2);
    if (direction === Direction.TOP) box.height = halfHeight;
    else if (direction === Direction.DOWN) {
      box.height -= halfHeight;
      box.y += halfHeight;
    } else {
      if (direction === Direction.RIGHT) box.x += box.width;
      box.width = 0;
    }
    return this.expand(box);
  }

  getHoverBox(node, direction: Direction, level?: number): BoundingBox {
    let box = this.getElementRect(node);
    if (direction === Direction.DOWN || direction === Direction.TOP) {
      if (direction === Direction.TOP)  box.y -= this.options.spacing;
      if (direction === Direction.DOWN) box.y += box.height;
      box.height = this.options.spacing;
    } else {
      throw "";
    }
    return box;
  }

  getHoverBoxOnSelected(node, level: number): BoundingBox {
    // TODO
    return null;
  }
}
