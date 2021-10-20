import {DisplayObject} from '@pixi/display';

export function checkIntersect(
  objA: DisplayObject,
  objB: DisplayObject,
): boolean {
  objA.getBounds();
  objB.getBounds();

  const a = objA._bounds;
  const b = objB._bounds;

  const rightmostLeft = a.minX < b.minX ? b.minX : a.minX;
  const leftmostRight = a.maxX > b.maxX ? b.maxX : a.maxX;

  if (leftmostRight <= rightmostLeft) {
    return false;
  }

  const bottommostTop = a.minY < b.minY ? b.minY : a.minY;
  const topmostBottom = a.maxY > b.maxY ? b.maxY : a.maxY;
  return topmostBottom >= bottommostTop;
}
