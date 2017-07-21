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

  doRemoveEmpty() {
    for(var i = this.rowsOriginal.length - 1; i >= 0; i--) {
      this.rowsContainer[i].doRemoveOnTransform();
      if(this.rowsOriginal[i].length === 0) this.rowsOriginal.splice(i, 1);
    }
  }
}



export class TreeTransformation {

  constructor(public readonly inserted: any[]) { /*empty*/ }

  insertIntoRow(rowList: any[], index: number, indexInRow: number) {

  }

  insertRows(rowList: any[], index: number) {

  }
}
