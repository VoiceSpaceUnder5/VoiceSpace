import {Ticker} from '@pixi/ticker';
import {Viewport} from 'pixi-viewport';
import {DisplayContainer} from './DisplayContainer';
import {SceneManager} from './SceneManager';

export function createViewport(
  worldWidth: number,
  worldHeight: number,
): Viewport {
  const viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: worldWidth,
    worldHeight: worldHeight,
    ticker: Ticker.shared,
    interaction: SceneManager.app.renderer.plugins.interaction, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
  });
  viewport.clamp({
    direction: 'all', // (all, x, or y) using clamps of [0, viewport.worldWidth / viewport.worldHeight]; replaces left / right / top / bottom if set
    underflow: 'center', // where to place world if too small for screen (e.g., top - right, center, none, bottomleft)
  });
  viewport.clampZoom({
    maxScale: 1.2,
    minScale: 0.8,
  });
  viewport.moveCenter(worldWidth / 2, worldHeight / 2);
  return viewport;
}

export function setViewportFollow(
  viewport: Viewport,
  target: DisplayContainer,
): void {
  viewport
    .wheel({
      center: target.position,
    })
    .pinch({
      center: target.position,
    })
    .follow(target);
}

// //viewport Culling 추가
// this.cull = new Simple();
// this.cull.addList(world.children);
// this.cull.cull(viewport.getVisibleBounds());
