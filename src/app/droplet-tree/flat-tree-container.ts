import { RowContainer, RowContainerFull, RowContainerShared } from './_interfaces/container'
import { Generator } from './generator-abstract'

export class FlatTreeContainer {

  public flat: RowContainerFull[] = [];
  public selected: RowContainer[] = [];

  constructor (private generator: Generator, private tree: object[][]) {
    this.flatten(tree);
  }

  private static MAX_DEPTH: number = 12;

  private getIsSelected(rowRaw) {
    if (rowRaw.length >= 0) return rowRaw.map(x => this.generator.isSelected(x));
    return [this.generator.isSelected(rowRaw)];
  }

  flatten (rowsRaw: object[], level: number = 0, parentOnLevel: RowContainerFull[] = []) {
    if (level === FlatTreeContainer.MAX_DEPTH) return;
    let shared: RowContainerShared = { rowsRaw, rowsContainer: [] };

    for(let index = 0; index < rowsRaw.length; index++) {
      let container = {
        flatListIndex: this.flat.length, parentOnLevel, level, firstChild: null, lastChild: null,
        shared, isSelected: this.getIsSelected(rowsRaw[index]), rowsRawIndex: index
      };
      if (container.isSelected.some(x => x)) this.selected.push(container);
      shared.rowsContainer.push(container);

      let parent = parentOnLevel[level-1];
      if(parent && index === 0) parent.firstChild = container;
      if(parent && index === rowsRaw.length - 1) parent.lastChild = container;

      // Here isSelected is still garantied to be a full list
      if(container.isSelected.some(x => !x)) {
        let children = this.generator.getChildren(rowsRaw[index]);
        this.flatten(children, level + 1, parentOnLevel.concat([container]));
      }
    }
  }
}
