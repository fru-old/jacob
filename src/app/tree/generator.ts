import { BoundingBox, Coordinate, Target, TargetActions } from '../core/generator.interfaces'
import { TargetGenerator } from '../core/generator.abstract'
import { TreeRowContainer } from './container'
import { FlattenedTree } from './flatten'

export abstract class TreeGenerator extends TargetGenerator {
  public static readonly SOURCE = 'source';
  public static readonly PREVIEW = 'preview';
  public static readonly IS_SOURCE = 'isSource'

  constructor(public flattened: FlattenedTree) {super();}

  // TODO implement target generator

  // Are these needed?
  //getBounds(node, includeChildren: boolean): BoundingBox;
  //getMargin(node, includeChildren: boolean): BoundingBox;
  //getLevelWidth(): number;
  //Inline nodes don't have children but multiple can be in same row
  //isInline(node) { return false; }


  // generate: flatten, build targets, map+concat

  // !!!!!!!!!!!!!!!!!
  // First implement:




  abstract setLevel(source, offset);
  abstract dropAfterAndDetach(relative: TreeRowContainer, offset: number);
  abstract dropBeforeAllAndDetach(relative: TreeRowContainer);
  abstract dropAtIndexAndDetach(relative: TreeRowContainer, index: number);



}
