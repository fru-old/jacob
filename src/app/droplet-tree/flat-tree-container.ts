import { RowContainer } from './_interfaces/container'
import { Generator } from './generator-abstract'

export class FlatTreeContainer {

  public flatList: RowContainer[] = [];
  public selected: RowContainer[] = [];
  private previousOnLevel: RowContainer[] = [];

  constructor (private generator: Generator, private tree: object[][]) {
    //this.flatten(tree);
  }
  /*
  fillNodesAndSelected (nodesOriginal: object[], nodesContainer: NodeContainer[], rowContainer: RowContainer) {
    for(let index = 0; index < nodesOriginal.length; index++) {
      let isSelected = this.generator.isSelected(nodesOriginal[index]);
      let node = { index, rowContainer, isSelected };
      nodesContainer.push(node);
      if (isSelected) this.selected.push(node);
    }
  }

  private static MAX_DEPTH: number = 12;

  flatten (rowsOriginal: object[][], level: number = 0) {
    if (level === FlatTreeContainer.MAX_DEPTH) return;
    let rowsContainer: RowContainer[] = [];
    let listContainer: RowListContainer = { rowsOriginal, rowsContainer };

    for(let index = 0; index < rowsOriginal.length; index++) {
      let previousOnLevel = this.previousOnLevel.slice();
      let nodesOriginal = rowsOriginal[index];
      let nodesContainer: NodeContainer[] = []

      let rowContainer = { index, listContainer,nodesContainer, nodesOriginal, level, previousOnLevel };
      this.fillNodesAndSelected(nodesOriginal,  nodesContainer, rowContainer);
      previousOnLevel[level] = rowContainer;
      rowsContainer.push(rowContainer);
      this.rows.push(rowContainer);

      if(nodesContainer.length === 1 && !nodesContainer[0].isSelected) {
        let children = this.generator.getChildren(nodesOriginal[0]);
        this.flatten(children, level + 1);
      }
    }
    this.lists.push(listContainer);
  }*/
}
