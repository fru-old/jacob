export class HiddenDataHelper {

  public static readonly SOURCE = 'source';
  public static readonly PREVIEW = 'preview';
  public static readonly IS_SELECTED = 'isSelected';

  private static getOrInitDropletProperty(context: any, init = false) {
    if (!context.__droplet && init) context.__droplet = {};
    return context.__droplet || {};
  }

  private static idCounter = 1;
  static getUniqueId() {
    return HiddenDataHelper.idCounter++;
  }

  static getHidden(name: string, context: any): any {
    return HiddenDataHelper.getOrInitDropletProperty(context)[name];
  }

  static setHidden(name: string, context: any, data: any) {
    var droplet = HiddenDataHelper.getOrInitDropletProperty(context, true);
    if (droplet[name]) throw 'Only one ' + name + ' can be attached to the same context.';
    droplet[name] = data;
    return () => { delete droplet[name]; };
  }
}
