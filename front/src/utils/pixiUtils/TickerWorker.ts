export function tickerWorker(): void {
  let intervalId: NodeJS.Timeout;

  self.addEventListener('message', event => {
    if (event.data.run === true) {
      intervalId = setInterval(() => {
        console.log(`SendMessage: `, event.data.run);
        self.postMessage({message: 'run'});
      }, 1000 / 60);
    }

    if (event.data.run === false) {
      clearInterval(intervalId);
    }
  });
}
