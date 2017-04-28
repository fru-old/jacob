export type BoundingBox = {x: number, y: number, width: number, height: number}

export abstract class BoundingBoxElement {
  public abstract getBoundingBox(): BoundingBox;

  public static sumBoxes(boxes: BoundingBox[]): BoundingBox {
    var minX = null, minY = null, maxX = null, maxY = null;
    for (let box of boxes) {
      if (minX === null || box.x <= minX) minX = box.x;
      if (minY === null || box.y <= minY) minY = box.y;
      if (maxX === null || box.x + box.width  >= maxX) maxX = box.x + box.width;
      if (maxY === null || box.y + box.height >= maxY) maxY = box.y + box.height;
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  public static getBoundingBox(element) { // crossbrowser version
    var box = element.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var y  = Math.round(box.top +  scrollTop - clientTop);
    var x = Math.round(box.left + scrollLeft - clientLeft);

    return { x, y, width: element.offsetWidth, height: element.offsetHeight };
  }
}
