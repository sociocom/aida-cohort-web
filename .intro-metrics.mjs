const ws = new WebSocket(process.env.AIDA_CDP_URL);
const width = Number(process.env.AIDA_VIEWPORT_WIDTH);
const height = Number(process.env.AIDA_VIEWPORT_HEIGHT);
const expression = `JSON.stringify({
  viewport: [innerWidth, innerHeight],
  documentWidth: document.documentElement.scrollWidth,
  introduction: document.querySelector('#introduction').getBoundingClientRect().toJSON(),
  lead: document.querySelector('.intro-lead').getBoundingClientRect().toJSON(),
  story: document.querySelector('.intro-story').getBoundingClientRect().toJSON()
})`;

const timeout = setTimeout(() => process.exit(2), 8_000);

ws.addEventListener('open', () => {
  ws.send(JSON.stringify({
    id: 1,
    method: 'Emulation.setDeviceMetricsOverride',
    params: { width, height, deviceScaleFactor: 1, mobile: width < 720 },
  }));
});

ws.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (message.id === 1) {
    ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
  } else if (message.id === 2) {
    console.log(message.result.result.value);
    ws.send(JSON.stringify({ id: 3, method: 'Browser.close' }));
  } else if (message.id === 3) {
    clearTimeout(timeout);
    ws.close();
  }
});
