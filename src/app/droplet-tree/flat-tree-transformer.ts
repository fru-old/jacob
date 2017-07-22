import { Generator } from './generator-abstract'
import { RowListContainer } from './_interfaces/container'

export class FlatTreeTransformer {

  private doneTransformation = false;
  private transformationGuard() {
    if (this.doneTransformation) throw 'Done transformation';
    this.doneTransformation = true;
  }

  constructor(private generator: Generator) { /*empty*/ }

  private insertAtIndex(target: any[], index: number, inserted: any[]) {
    Array.prototype.splice.apply(target, [index, 0].concat(inserted));
  }

  private getSelectedNodesOriginal() {
    return this.generator.tree.selected.map(x => x.rowContainer.nodesOriginal[x.index]);
  }

  insertIntoRow(rowList: object[][], index: number, indexInRow: number) {
    this.transformationGuard();
    this.insertAtIndex(rowList[index], indexInRow, this.getSelectedNodesOriginal());
  }

  insertRows(rowList: object[][], index: number) {
    this.transformationGuard();
    this.insertAtIndex(rowList, index, this.getSelectedNodesOriginal().map(x => [x]));
  }

  removeSelected(rows: RowListContainer) {
    for(var i = rows.rowsOriginal.length - 1; i >= 0; i--) {

      let nodesOriginal = rows.rowsOriginal[i];
      for(var j = nodesOriginal.length - 1; j >= 0; j--) {
        if(rows.rowsContainer[i].nodesContainer[j].isSelected) nodesOriginal.splice(j, 1);
      }

      if(nodesOriginal.length === 0) rows.rowsOriginal.splice(i, 1);
    }
  }
}
