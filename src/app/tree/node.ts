export class TreeRowContainer {
  constructor(
    public readonly level: number,
    public readonly previousOnLevel: TreeRowContainer[],
    public readonly nodesOriginal: any[],
    private removeOnTransform: boolean[]
  ) { /*empty*/ }

  doRemoveOnTransform() {
    for(var i = this.removeOnTransform.length - 1; i >= 0; i--) {
      if(this.removeOnTransform[i]) this.nodesOriginal.splice(i, 1);
    }
  }
}

export class TreeRowListContainer {
  constructor(
    public readonly rowsOriginal: any[],
    public readonly rowsContainer: TreeRowContainer[]
  ) { /*empty*/ }

  doRemoveOnTransformAndEmpty() {
    for(var i = this.rowsOriginal.length - 1; i >= 0; i--) {
      this.rowsContainer[i].doRemoveOnTransform();
      if(this.rowsOriginal[i].length === 0) this.rowsOriginal.splice(i, 1);
    }
  }
}

export class TreeTransformation {

  public readonly inserted: any[]
  constructor(inserted: any[]) {
    this.inserted = inserted.map(x => x.length >= 0 ? x : [x]).reduce((a,b) => a.concat(b));
  }

  insertIntoRow(rowList: any[], index: number, indexInRow: number) {
    rowList[index].splice(indexInRow, 0, this.inserted);
  }

  insertRows(rowList: any[], index: number) {
    rowList.splice(index, 0, this.inserted.map(x => [x]));
  }
}
