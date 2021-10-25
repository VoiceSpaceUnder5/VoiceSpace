export function tickerWorker(): void {
  let intervalId: NodeJS.Timeout;

  self.addEventListener('message', event => {
    if (event.data.run === true) {
      intervalId = setInterval(() => {
        self.postMessage({message: 'run'});
      }, 16.66);
    }

    if (event.data.run === false) {
      clearInterval(intervalId);
    }
  });
}
