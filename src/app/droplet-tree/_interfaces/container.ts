export interface NodeContainer {
  readonly index: number;
  readonly rowContainer: RowContainer;

  // Inline nodes don't have children but multiple can be in the same row
  // readonly isInline:  boolean;

  // The selected nodes are beeing dragged etc.
  readonly isSelected: boolean;
}

export class RowContainer {
  readonly index: number;
  readonly listContainer: RowListContainer;
  readonly nodesContainer: NodeContainer[];
  readonly nodesOriginal: object[];
  readonly level: number;
  readonly previousOnLevel: RowContainer[];
}

export interface RowListContainer {
  readonly rowsContainer: RowContainer[];
  readonly rowsOriginal: object[][];
}
