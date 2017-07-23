import { Generator } from './generator-abstract'
import { RowContainer, RowContainerShared } from './_interfaces/container'

export class FlatTreeTransformer {

  constructor(private generator: Generator) { /*empty*/ }

  private insertAtIndex(target: any[], index: number, inserted: any[]) {
    if (!(index >= 0)) index = target.length;
    Array.prototype.splice.apply(target, [index, 0].concat(inserted));
  }

  private areAllNodesSelected(selected: RowContainer) {
    let multi: any = this.generator.getMultiRow(selected.shared.rowsRaw[selected.rowsRawIndex]);
    return !multi || multi.length === multi.filter((_, i) => selected.isSelected[i]).length;
  }

  private getSelectedRaw(selected: RowContainer) {
    let raw: object = selected.shared.rowsRaw[selected.rowsRawIndex];
    let multi: object[] = this.generator.getMultiRow(raw);
    if (this.areAllNodesSelected(selected)) return raw;
    let result = {};
    let multiResult = this.generator.getMultiRow({}, true);
    this.insertAtIndex(multiResult, null, multi.filter((_, i) => selected.isSelected[i]));
    return result;
  }

  private removeFullRow(selected: RowContainer) {
    let shared = selected.shared;
    shared.rowsRaw.splice(selected.rowsRawIndex, 1);
    shared.rowsContainer.splice(selected.rowsRawIndex, 1);
    for(let movedUp of shared.rowsContainer.slice(selected.rowsRawIndex)) {
      movedUp.rowsRawIndex--;
    }
  }

  moveChildren(target: RowContainerShared, firstMovedChild: RowContainer) {
    let shared = firstMovedChild.shared;
    let detachedRaw = shared.rowsRaw.splice(firstMovedChild.rowsRawIndex);
    let detachedContainer = shared.rowsContainer.splice(firstMovedChild.rowsRawIndex);
    for(let i = 0; i < detachedContainer.length; i++) {
      detachedContainer[i].rowsRawIndex = i + target.rowsContainer.length;
    }
    this.insertAtIndex(target.rowsContainer, null, detachedContainer);
    this.insertAtIndex(target.rowsRaw, null, detachedRaw);
  }

  removeSelected() {
    for(let selected of this.generator.tree.selected) {
      if (this.areAllNodesSelected(selected)) this.removeFullRow(selected);
      else {
        // Only remove some nodes
        let raw = selected.shared.rowsRaw[selected.rowsRawIndex];
        let multi: object[] = this.generator.getMultiRow(raw);
        for(let i = multi.length - 1; i >= 0; i--) {
          if (selected.isSelected[i]) {
            multi.splice(i, 1);
            selected.isSelected.splice(i, 1);
          }
        }
      }
    }
  }

  copySelectedIntoRow(row: RowContainer, indexInRow: number) {
    let rawInserted = [];
    for(let selected of this.generator.tree.selected) {
      let raw: object = selected.shared.rowsRaw[selected.rowsRawIndex];
      let multi = this.generator.getMultiRow(raw);
      rawInserted = rawInserted.concat(multi ? multi: [raw]);
    }
    this.insertAtIndex(row.shared.rowsRaw, indexInRow, rawInserted);
    this.insertAtIndex(row.isSelected, indexInRow, new Array(rawInserted.length));
  }

  copySelectedInto(rows: RowContainerShared, indexOfRow: number) {
    let copy: RowContainer = null;
    let containerIndex = indexOfRow;
    let insertedRaw = [];

    for(let selected of this.generator.tree.selected) {
      copy = { shared: rows, isSelected: [], rowsRawIndex: containerIndex };
      this.insertAtIndex(rows.rowsContainer, containerIndex, [copy]);
      insertedRaw.push(this.getSelectedRaw(selected));
      containerIndex++;
    }

    this.insertAtIndex(rows.rowsRaw, indexOfRow, insertedRaw);
    for(let movedDown of rows.rowsContainer.slice(indexOfRow + insertedRaw.length)) {
      movedDown.rowsRawIndex += insertedRaw.length;
    }
  }
}
