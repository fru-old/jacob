export class TreeRowContainer {
  private removeOnTransform: boolean[] = [];

  constructor(
    public readonly level: number,
    public readonly previousOnLevel: TreeRowContainer[],
    public readonly list: TreeRowListContainer,
    public readonly nodesOriginal: any[],
    transformation: TreeTransformation
  ) {
    nodesOriginal.forEach((e, i) => this.removeOnTransform[i] = transformation.isSource(e));
  }

  doRemoveOnTransform() {
    for(var i = this.removeOnTransform.length - 1; i >= 0; i--) {
      if(this.removeOnTransform[i]) this.nodesOriginal.splice(i, 1);
    }
  }
}

export class TreeRowListContainer {
  public rowsContainer: TreeRowContainer[];

  constructor(public readonly rowsOriginal: any[]) { /*empty*/ }

  doRemoveOnTransformAndEmpty() {
    for(var i = this.rowsOriginal.length - 1; i >= 0; i--) {
      this.rowsContainer[i].doRemoveOnTransform();
      if(this.rowsOriginal[i].length === 0) this.rowsOriginal.splice(i, 1);
    }
  }
}

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

  insertIntoRow(rowList: any[], index: number, indexInRow: number) {
    this.transformationGuard();
    rowList[index].splice(indexInRow, 0, ...this.normalized);
  }

  insertRows(rowList: any[], index: number) {
    this.transformationGuard();
    rowList.splice(index, 0, ...this.normalized.map(x => [x]));
  }
}
