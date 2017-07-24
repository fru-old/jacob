export class HiddenDataHelper {

  public static readonly SOURCE = 'source';
  public static readonly PREVIEW = 'preview';
  public static readonly IS_SOURCE = 'isSource';

  private getOrInitDropletProperty(context: any, init = false) {
    if (!context.__droplet && init) context.__droplet = {};
    return context.__droplet || {};
  }

  private static idCounter = 1;
  public static getUniqueId() {
    return HiddenDataHelper.idCounter++;
  }

  getHidden(name: string, context: any): any {
    return this.getOrInitDropletProperty(context)[name];
  }

  setHidden(name: string, context: any, data: any) {
    var droplet = this.getOrInitDropletProperty(context, true);
    if (droplet[name]) throw 'Only one ' + name + ' can be attached to the same context.';
    droplet[name] = data;
    return () => { delete droplet[name]; };
  }
}
