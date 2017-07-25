import { RowContainer, RowContainerFull, RowContainerShared } from './_interfaces/container';
import { Generator } from './generator-abstract';
import { Target } from './_interfaces/target';
import { TargetBuilder } from './target-actions/target-builder';

export class FlatTreeContainer {

  readonly flat: RowContainerFull[] = [];
  readonly selected: RowContainer[] = [];

  constructor (private generator: Generator, private tree: object[]) {
    this.flatten(tree);
  }

  readonly targetBuilder = new TargetBuilder(this.generator);

  private static MAX_DEPTH: number = 12;

  private getIsSelected(rowRaw) {
    if (rowRaw.length >= 0) return rowRaw.map(x => this.generator.isSelected(x));
    return [this.generator.isSelected(rowRaw)];
  }

  hasSomeSelected(current: RowContainerFull): boolean {
    if (!current) return false;
    return this.flat[current.flatIndex].isSelected.some(x => x);
  }

  getMultiRow(current: RowContainer): object[] {
    return this.generator.getMultiRow(current.shared.rowsRaw[current.rowsRawIndex]);
  }

  searchFlatForUnselected(current: RowContainerFull, forward: boolean) {
    let index = current.flatIndex;
    while (true) {
      index += forward ? 1 : -1;
      if (!this.flat[index]) return null;
      if (!this.hasSomeSelected(this.flat[index])) return this.flat[index];
    }
  }

  getChildrenSharedContainer(parent: RowContainerFull): RowContainerShared {
    let next = this.flat[parent.flatIndex + 1];
    if (next.level < parent.level) return next.shared;
    let raw = parent.shared.rowsRaw[parent.rowsRawIndex];
    return {rowsRaw: this.generator.getChildren(raw, true), rowsContainer: []}
  }

  private flatten (rowsRaw: object[], level: number = 0, parentOnLevel: RowContainerFull[] = []) {
    if (level === FlatTreeContainer.MAX_DEPTH) return;
    let shared: RowContainerShared = { rowsRaw, rowsContainer: [] };

    for(let index = 0; index < rowsRaw.length; index++) {
      let container = {
        flatIndex: this.flat.length, parentOnLevel, level, firstChild: null, lastChild: null,
        shared, isSelected: this.getIsSelected(rowsRaw[index]), rowsRawIndex: index
      };
      if (container.isSelected.some(x => x)) this.selected.push(container);
      shared.rowsContainer.push(container);
      this.flat.push(container);

      let parent = parentOnLevel[level-1];
      if(parent && index === 0) parent.firstChild = container;
      if(parent && index === rowsRaw.length - 1) parent.lastChild = container;
      
      // Here isSelected is still garantied to be a full list
      if(container.isSelected.some(x => !x)) {
        let children = this.generator.getChildren(rowsRaw[index]);
        if (children) this.flatten(children, level + 1, parentOnLevel.concat([container]));
      }
    }
  }

  generateTargets(): Target[] {
    if (this.flat.length === 0) return [];
    return this.flat.map(x => this.targetBuilder.build(x)).reduce((a,b) => a.concat(b));
  }
}
