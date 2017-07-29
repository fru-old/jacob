import { DragBackend } from './drag-backend';
import { DropletSource, DropletPreview } from './_interfaces/droplet';

export class DragRegistry {

  constructor(private idAccessor: (context: any) => string) { /*empty*/ }

  static readonly SOURCE = 'source';
  static readonly PREVIEW = 'preview';
  static readonly UNDO = 'undo';
  static readonly IS_SELECTED = 'isSelected';

  private state: any = {};
  private registered: {[key: string]: DropletSource} = {};

  private connectSourceAndPreview(backend: DragBackend, id, state, type: string) {
    if(state[DragRegistry.SOURCE] && state[DragRegistry.PREVIEW]) {
      let source: DropletSource = state[DragRegistry.SOURCE];
      let preview: DropletPreview = state[DragRegistry.PREVIEW];

      if (state[DragRegistry.UNDO]) state[DragRegistry.UNDO]();
      let undo = backend.connectSourceAndPreview(id, source, preview);
      this.registered[id] = source;

      return state[DragRegistry.UNDO] = function () {
        delete this.registered[id];
        delete state[DragRegistry.UNDO];
        delete state[type];
        undo();
      }
    } else {
      return function() { delete state[type]; };
    }
  }

  private register(backend: DragBackend, type: string, id: any, value: any) {
    let state = this.state[id] || (this.state[id] = {});
    state[type] = value;
    return state;
  }

  registerSource(backend: DragBackend, source: DropletSource) {
    let id = this.getId(source.context);
    let state = this.register(backend, DragRegistry.SOURCE, id, source);
    return this.connectSourceAndPreview(backend, id, state, DragRegistry.SOURCE);
  }

  registerPreview(backend: DragBackend, preview: DropletPreview) {
    let id = this.getId(preview.context);
    let state = this.register(backend, DragRegistry.PREVIEW, id, preview);
    return this.connectSourceAndPreview(backend, id, state, DragRegistry.PREVIEW);
  }

  setSelected(backend: DragBackend, id: any, selected: boolean) {
    let state = this.register(backend, DragRegistry.IS_SELECTED, id, selected);
    return function () { delete state[DragRegistry.IS_SELECTED] };
  }

  getId(context: any) {
    return this.idAccessor(context);
  }

  getRegisteredSource(key: string): DropletSource {
    return this.registered[key];
  }

  isSelected(context: any): boolean {
    let id = this.getId(context);
    return this.state[id] && this.state[id][DragRegistry.IS_SELECTED];
  }

  getDomNode(context: any, usePreview: boolean): HTMLElement {
    let id = this.getId(context);
    if (!this.state[id]) return null;
    if (usePreview) return this.state[id][DragRegistry.PREVIEW].getNativeElement();
    else return this.state[id][DragRegistry.SOURCE].getNativeElement();
  }
}
