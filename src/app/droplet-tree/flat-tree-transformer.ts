import { Generator } from './generator-abstract'
import { RowContainer, RowContainerShared } from './_interfaces/container'

export class FlatTreeTransformer {

  constructor(private generator: Generator) { /*empty*/ }

  private insertAtIndex(target: any[], index: number, inserted: any[]) {
    if (!(index >= 0)) index = target.length;
    Array.prototype.splice.apply(target, [index, 0].concat(inserted));
  }

  private areAllNodesSelected(selected: RowContainer) {
    let raw: any = selected.shared.rowsRaw[selected.rowsRawIndex];
    return raw.length >= 0
        && raw.length === raw.filter((_, i) => selected.isSelected[i]).length;
  }

  private getSelectedRaw(selected: RowContainer) {
    let raw: any = selected.shared.rowsRaw[selected.rowsRawIndex];
    if (this.areAllNodesSelected(selected)) return raw;
    else return raw.filter((_, i) => selected.isSelected[i]);
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

  private removeFullRow(selected: RowContainer) {
    let shared = selected.shared;
    shared.rowsRaw.splice(selected.rowsRawIndex, 1);
    shared.rowsContainer.splice(selected.rowsRawIndex, 1);
    for(let movedUp of shared.rowsContainer.slice(selected.rowsRawIndex)) {
      movedUp.rowsRawIndex--;
    }
  }

  removeSelected() {
    for(let selected of this.generator.tree.selected) {
      if (this.areAllNodesSelected(selected)) this.removeFullRow(selected);
      else {
        // Only remove some nodes
        let raw: any = selected.shared.rowsRaw[selected.rowsRawIndex];
        for(let i = raw.length - 1; i >= 0; i--) {
          if (selected.isSelected[i]) {
            raw.splice(i, 1);
            selected.isSelected.splice(i, 1);
          }
        }
      }
    }
  }

  copySelectedIntoRow(row: RowContainer, indexInRow: number) {
    let rawInserted = [];
    for(let selected of this.generator.tree.selected) {
      let raw = this.getSelectedRaw(selected);
      rawInserted = rawInserted.concat(raw.length >= 0 ? raw: [raw]);
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
