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
    childProperty: 'children',
    multiProperty: 'inline'
  };

  constructor (private raw: any[]) { super(); }
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

  getTargetBox(node, direction: Direction, before: boolean): BoundingBox {


    return null;
  }

  getHoverBox(node, direction: Direction, level?: number): BoundingBox {
    return null;
  }

  getHoverBoxOnSelected(node, level: number): BoundingBox {
    return null;
  }
}
