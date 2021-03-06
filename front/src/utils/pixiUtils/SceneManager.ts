import {Application} from 'pixi.js';
import {isMobile} from '../AgentCheck';
import {Scene} from './Scene';

export class SceneManager {
  private static application: Application;
  private static currentScene: Scene;
  private static gameCanvas: HTMLCanvasElement | undefined;
  private static tickerWorker: Worker;

  // We no longer need to store width and height since now it is literally the size of the screen.
  // We just modify our getters
  public static get width(): number {
    return Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0,
    );
  }
  public static get height(): number {
    return Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0,
    );
  }
  public static get app(): Application {
    return SceneManager.application;
  }

  public static initialize(background: number): void {
    if (!SceneManager.gameCanvas)
      throw new Error('Do not call before changeCanvas()');
    SceneManager.application = new Application({
      view: SceneManager.gameCanvas,
      resizeTo: window, // This line here handles the actual resize!
      resolution: 1,
      backgroundColor: background,
      antialias: true,
    });

    //visibility === visible 일 때 돌아갈 Ticker
    SceneManager.application.ticker.add(SceneManager.update);
    //visibility === hidden 일 때 돌아갈 Ticker
    SceneManager.addTickerWorker();
    document.addEventListener(
      'visibilitychange',
      SceneManager.handleVisibilityChange,
    );

    window.addEventListener('resize', SceneManager.resize);
    // mobile check
    if (isMobile()) {
      window.addEventListener('focusout', () => {
        window.scrollTo(0, 0);
      });
      window.addEventListener('focusin', () => {
        window.scrollTo(0, 0);
      });
    }
  }

  private static handleVisibilityChange(): void {
    if (document.visibilityState === 'hidden') {
      SceneManager.runTickerWorker();
      SceneManager.application.ticker.stop();
    } else if (document.visibilityState === 'visible') {
      SceneManager.stopTickerWorker();
      SceneManager.application.ticker.start();
    }
  }

  private static addTickerWorker(): void {
    SceneManager.tickerWorker = new Worker('./workers/TickerWorker.js');
  }

  private static runTickerWorker(): void {
    SceneManager.tickerWorker.postMessage({run: true});
    SceneManager.tickerWorker.onmessage = event => {
      if (event.data.message === 'run') SceneManager.update(1);
    };
  }

  private static stopTickerWorker() {
    SceneManager.tickerWorker.postMessage({run: false});
  }

  private static removeTickerWorker(): void {
    SceneManager.tickerWorker.postMessage({run: false});
    SceneManager.tickerWorker.terminate();
  }

  public static changeScene(newScene: Scene): void {
    // Remove and destroy old scene... if we had one..
    if (SceneManager.currentScene) {
      SceneManager.application.stage.removeChild(SceneManager.currentScene);
      SceneManager.currentScene.destroy();
    }

    // Add the new one
    SceneManager.currentScene = newScene;
    SceneManager.application.stage.addChild(SceneManager.currentScene);
  }

  public static changeCanvas(newCanvas: HTMLCanvasElement): void {
    SceneManager.gameCanvas = newCanvas;
  }

  public static destroy(): void {
    window.removeEventListener('resize', SceneManager.resize);
    SceneManager.removeTickerWorker();
    SceneManager.app.destroy();
  }

  public static resize(): void {
    // if we have a scene, we let it know that a resize happened!
    if (SceneManager.currentScene) {
      setTimeout(() => {
        SceneManager.currentScene.resize(
          SceneManager.width,
          SceneManager.height,
        );
      }, 50);
    }
  }

  /* More code of your SceneManager.ts like `changeScene` and `update`*/
  public static update(framesPassed: number): void {
    if (SceneManager.currentScene) {
      SceneManager.currentScene.update(framesPassed);
    }
  }
}
