import { TreeRowListContainer } from './container'

export class TreeTransformation {
  private readonly normalized: any[];
  private doneTransformation = false;

  constructor(sources: any[]) {
    this.normalized = sources.map(x => x.length >= 0 ? x : [x]).reduce((a,b) => a.concat(b));
  }

  private transformationGuard() {
    if (this.doneTransformation) throw 'Done transformation';
    this.doneTransformation = true;
  }

  isSource(item: any) { return this.normalized.indexOf(item) >= 0; }

  private insertAtIndex(target: any[], index: number, inserted: any[]) {
    Array.prototype.splice.apply(target, [index, 0].concat(inserted));
  }

  insertIntoRow(rowList: any[], index: number, indexInRow: number) {
    this.transformationGuard();
    this.insertAtIndex(rowList[index], indexInRow, this.normalized);
  }

  insertRows(rowList: any[], index: number) {
    this.transformationGuard();
    this.insertAtIndex(rowList, index, this.normalized.map(x => [x]));
  }

  removeSelected(rows: TreeRowListContainer) {
    for(var i = rows.rowsOriginal.length - 1; i >= 0; i--) {

      let nodesOriginal = rows.rowsOriginal[i];
      for(var j = nodesOriginal.length - 1; j >= 0; j--) {
        if(rows.rowsContainer[i].nodesContainer[j].isSelected) nodesOriginal.splice(j, 1);
      }

      if(nodesOriginal.length === 0) rows.rowsOriginal.splice(i, 1);
    }
  }
}
