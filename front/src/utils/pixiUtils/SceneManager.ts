import {Application} from 'pixi.js';
import {isMobile} from '../AgentCheck';
import {Scene} from './Scene';
import {tickerWorker} from './TickerWorker';

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
    console.log('Scene SceneManager Initialized! ');
  }

  private static handleVisibilityChange(): void {
    console.log(`Handle Visible: ${document.visibilityState}`);
    if (document.visibilityState === 'hidden') {
      console.log('Is hidden');
      SceneManager.runTickerWorker();
      SceneManager.application.ticker.stop();
    } else if (document.visibilityState === 'visible') {
      console.log('Is Visible');
      SceneManager.stopTickerWorker();
      SceneManager.application.ticker.start();
    }
  }

  private static addTickerWorker(): void {
    const tickerWorkerBlob = new Blob(
      [tickerWorker.toString().replace(/^function .+\{?|\}$/g, '')],
      {type: 'text/javascript'},
    );
    const workerBlobUrl = URL.createObjectURL(tickerWorkerBlob);
    SceneManager.tickerWorker = new Worker(workerBlobUrl);
    console.log(`AddTickerWorker: ${SceneManager.tickerWorker}`);
  }

  private static runTickerWorker(): void {
    SceneManager.tickerWorker.postMessage({run: true});
    SceneManager.tickerWorker.onmessage = event => {
      if (event.data.message === 'run') SceneManager.update(1);
    };
    console.log(`RunTickerWorker: ${SceneManager.tickerWorker}`);
  }

  private static stopTickerWorker() {
    SceneManager.tickerWorker.postMessage({run: false});
    console.log(`StopTickerWorker: ${SceneManager.tickerWorker}`);
  }

  private static removeTickerWorker(): void {
    SceneManager.tickerWorker.postMessage({run: false});
    SceneManager.tickerWorker.terminate();
  }

  public static changeScene(newScene: Scene): void {
    // Remove and destroy old scene... if we had one..
    if (SceneManager.currentScene) {
      console.log('Destroy current Scene!! ');
      SceneManager.application.stage.removeChild(SceneManager.currentScene);
      SceneManager.currentScene.destroy();
    }

    // Add the new one
    console.log('Add new Scene to SceneManager! ');
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
