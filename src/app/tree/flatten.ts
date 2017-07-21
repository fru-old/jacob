// Flattening + Finding Sources + Adding child lists
import { TreeSource, TreeSourceRow } from './source'

export class FlattenedTree {

  constructor(public readonly childProperty: string) {}

  public readonly list: TreeSourceRow[] = [];
  public readonly sources: TreeSource[] = [];

  getChildren(item: any, create: boolean): any[] {
    if (create && !item[this.childProperty]) item[this.childProperty] = [];
    return item[this.childProperty];
  }

  flattenChildren(item: any): boolean {
    let isSingle =
    return item && item[this.childProperty] && this.getHidden(item, TreeGenerator.IS_SOURCE);
  }

  flatten (items, source, results = [], level = 0, previousOnLevel = []): TreeSourceRow[] {
    items.forEach((item, itemsIndex) => {
      let row: TreeSourceRow = {
        items: items,
        itemsIndex: itemsIndex,
        level: level,
        previousOnLevel: previousOnLevel.slice(), // copy
        resultsIndex: results.length
      };

      previousOnLevel[level] = row;
      results.push(row);

      let children = this.getChildren(item);
      if (children && !this.skipChildren(item)) {
        this.flatten(children, source, results, level + 1, previousOnLevel);
      }
    });
    return results;
  }

  abstract initChildren(item: any): any[];
}
