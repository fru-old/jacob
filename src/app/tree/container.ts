import { TreeTransformation } from './transformer'

export class TreeRowContainer {
  private removeOnTransform: boolean[] = [];

  constructor(
    public readonly level: number,
    public readonly previousOnLevel: TreeRowContainer[],
    public readonly nodesOriginal: any[],
    public readonly nodesContainer: TreeNodeContainer[],
    public readonly listContainer: TreeRowListContainer,

    transformation: TreeTransformation
  ) {
    nodesOriginal.forEach((e, i) => this.removeOnTransform[i] = transformation.isSource(e));
  }
}

export interface TreeNodeContainer {
  readonly isSelected: boolean;
  readonly index: number;
  readonly rowContainer: TreeRowContainer;
}

export interface TreeRowListContainer {
  readonly rowsContainer: TreeRowContainer[];
  readonly rowsOriginal: any[][];
}
