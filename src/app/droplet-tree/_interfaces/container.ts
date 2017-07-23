// These properties have to be keeped consistent during transformations
export interface RowContainer {
  rowsRawIndex: number;
  // isSelected may be the empty array if no nodes are selected
  isSelected: boolean[];
  shared: RowContainerShared;
}

// Shared between all RowContainer's in the same children group
// These are also consistent during transformations
export interface RowContainerShared {
  readonly rowsRaw: object[][] | object[];
  readonly rowsContainer: RowContainer[];
}

// Seperate interface, because these are only consistent before transformations
export interface RowContainerBeforeTransform extends RowContainer {
  readonly flatListIndex: number;
  readonly level: number;
  readonly parentOnLevel: RowContainer[];
  firstChild: RowContainer;
  lastChild: RowContainer;
}
