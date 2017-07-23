export interface NodeContainer {
  // Consistent for inserts:
  index: number;
  rowContainer: RowContainer;
  // Consistent:
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
