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
    left: false, // whether to clamp to the left and at what value
    right: false, // whether to clamp to the right and at what value
    top: false, // whether to clamp to the top and at what value
    bottom: false, // whether to clamp to the bottom and at what value
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
