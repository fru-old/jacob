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
}
