let intervalId;

addEventListener('message', event => {
  console.log('message event fired');
  if (event.data.run === true) {
    intervalId = setInterval(() => {
      // console.log(`SendMessage: `, event.data.run);
      // console.log(event);
      postMessage({message: 'run'});
    }, 1000 / 60);
  }

  if (event.data.run === false) {
    clearInterval(intervalId);
  }
});
