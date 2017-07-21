import { BoundingBox, Coordinate, Target } from './generator.interfaces'

export abstract class TargetGenerator {
  abstract generate(data): Target[];
  abstract isSource(item): boolean;

  private getOrInitDropletProperty(context: any) {
    if (!context.__droplet) context.__droplet = {};
    return context.__droplet;
  }

  getHidden(name: string, context: any): any {
    return this.getOrInitDropletProperty(context)[name];
  }

  setHidden(name: string, context: any, data: any) {
    var droplet = this.getOrInitDropletProperty(context);
    if (droplet[name]) throw 'Only one ' + name + ' can be attached to the same context.';
    droplet[name] = data;
    return () => { delete droplet[name]; };
  }

  private getHighestPriority(matches: Target[]) {
    // TODO
    return matches[0];
  }

  hover(matches: Target[], start: Coordinate, now: Coordinate): BoundingBox {
    let highest = this.getHighestPriority(matches);
    return highest && highest.actions.hover(start, now);
  }

  drop(matches: Target[], start: Coordinate, now: Coordinate) {
    let highest = this.getHighestPriority(matches);
    if (highest) highest.actions.drop(start, now);
  }
}
