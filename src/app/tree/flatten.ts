// Flattening + Finding Sources + Adding child lists
import { TreeRowContainer, TreeRowListContainer, TreeTransformation } from './container'

export class FlattenedTree {

  public transformer: TreeTransformation = new TreeTransformation(this.sources);
  public lists: TreeRowListContainer[] = [];
  public rows: TreeRowContainer[] = [];

  constructor(public readonly childProperty: string, private sources: any[], private tree: any[]) {
    this.flatten(tree);
  }

  flatten (listItems, level = 0, previousOnLevel = []) {
    let listContainer = new TreeRowListContainer(listItems);
    this.lists.push(listContainer);
    listContainer.rowsContainer = listItems.map(rowItems => {
      let rowContainer = new TreeRowContainer(level, previousOnLevel.slice(), listContainer, rowItems, this.transformer);
      previousOnLevel[level] = rowContainer;
      this.rows.push(rowContainer);

      let children = this.getChildrenWhenNotSingleAndSource(rowItems);
      if (children) this.flatten(children, level + 1, previousOnLevel);
      return rowContainer;
    });
  }

  private getChildrenWhenNotSingleAndSource(rowItems: any[]): any[] {
    if (this.isSingleAndSource(rowItems)) return null;
    return rowItems[0][this.childProperty];
  }

  isSingleAndSource(rowItems: any[]) {
    return rowItems.length === 1 && this.transformer.isSource(rowItems[0])
  }

  getSourceAt(rowItems: any[], index: number) {
    return this.transformer.isSource(rowItems[index]) ? rowItems[index] : null;
  }

  getOrCreateChildList(item: any) {
    if (!item[this.childProperty]) item[this.childProperty] = [];
    return item[this.childProperty];
  }
}
