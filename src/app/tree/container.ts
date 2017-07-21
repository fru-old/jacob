import { TreeTransformation } from './transformer'

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
