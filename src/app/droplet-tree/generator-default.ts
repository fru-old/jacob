import { BoundingBox, Coordinate, Direction } from './_interfaces/geometry';
import { Target } from './_interfaces/target';
import { FlatTreeContainer } from './flat-tree-container';
import { FlatTreeTransformer } from './flat-tree-transformer';
import { HiddenDataHelper } from './hidden-data-helper';
import { Generator } from './generator-abstract';

export class DefaultGenerator extends Generator {

  private options: any;
  constructor (private root: HTMLElement, private raw: any[], options: any = {}) {
    super();
    this.options = {
      levelWidth: options.levelWidth || 20,
      spacing:    options.spacing    || 8,
      childProperty: options.childProperty || 'children',
      multiProperty: options.multiProperty || 'inline'
    };
    this.tree = new FlatTreeContainer(this, this.raw);
    this.transformer = new FlatTreeTransformer(this);
  }

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

  private getNodeRect(node, dontUsePreview?: boolean): BoundingBox {
    let key = (this.isSelected(node) && !dontUsePreview) ? HiddenDataHelper.PREVIEW : HiddenDataHelper.SOURCE;
    let element = HiddenDataHelper.getHidden(key, node).reference.nativeElement;
    return this.getElementRect(element);
  }

  private getElementRect(element: HTMLElement): BoundingBox {
    let box = element.getBoundingClientRect();
    let relative = this.root.getBoundingClientRect();
    return {
      x: box.left - relative.left,
      y: box.top  - relative.top,
      width:  box.width,
      height: box.height
    };
  }

  expand(box: BoundingBox) {
    return {
      x: box.x - this.options.spacing,
      y: box.y - this.options.spacing / 2,
      width:  box.width  + 2 * this.options.spacing,
      height: box.height + this.options.spacing
    };
  }

  getTargetBox(node, direction: Direction, levelAdded: number): BoundingBox {
    let box = this.getNodeRect(node);
    let halfHeight = Math.ceil(box.height / 2);
    if (direction === Direction.DOWN || direction === Direction.TOP) {
      if (direction === Direction.TOP) box.height = halfHeight;
      else { box.height -= halfHeight; box.y += halfHeight; }
      if (levelAdded) {
        box.x -= levelAdded * this.options.levelWidth;
        box.width += levelAdded * this.options.levelWidth;
      }
    } else {
      if (direction === Direction.RIGHT) box.x += box.width;
      box.width = 0;
    }
    return this.expand(box);
  }

  setLevel(y: number, height: number, level: number): BoundingBox {
    let root = this.getElementRect(this.root);
    let levelSpacing = level * this.options.levelWidth;
    return {
      y, height, x: this.options.spacing + levelSpacing,
      width: root.width - 2 * this.options.spacing - levelSpacing
    }
  }

  getHoverBox(node, direction: Direction, level?: number): BoundingBox {
    let box = this.getNodeRect(node, true);
    if (direction === Direction.DOWN || direction === Direction.TOP) {
      let y = box.y + (direction === Direction.DOWN ? box.height : -this.options.spacing);
      return this.setLevel(y, this.options.spacing, level);
    } else {
      if (direction === Direction.LEFT)  box.x -= this.options.spacing;
      if (direction === Direction.RIGHT) box.x += box.width;
      box.width = this.options.spacing;
    }
  }

  getHoverBoxOnSelected(node, level: number): BoundingBox {
    let box = this.getNodeRect(node, true);
    let y = box.y + Math.ceil(box.height / 2) - this.options.spacing / 2;
    return this.setLevel(y, this.options.spacing, level);
  }
}
