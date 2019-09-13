// ffmpeg -r 30 -i ./out/%04d.png -vcodec h264 -pix_fmt yuv420p -crf 22 -s 2000x2000 animation_03.mp4
const fs = require('fs');
const rimraf = require('rimraf');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const { optionList, helpMenu } = require('./src/cliOptions.js');
const TimelineMax = require('./src/tweenmax.min.js').TimelineMax;
const drawSpiral = require('./src/spiral.js');
const drawLines = require('./src/lines.js');

const options = commandLineArgs(optionList);
const destinationPath = `${__dirname}/${options._all.destination}`;
const frames = options._all.framerate * options._all.duration;
const help = commandLineUsage(helpMenu)

if (options._all.help) {
  console.log(help);
} else {
  clearDestinationDir();
  drawImages(options._all.action);
  console.log(`Seed Used: ${options._all.noiseseed}`);
}

function padNumber(number, length) {
  let n = number.toString();
  while (n.length < length) {
    n = `0${n}`;
  }
  return n;
};

function clearDestinationDir() {
  if (fs.existsSync(destinationPath)) {
    rimraf.sync(destinationPath);
  }
  fs.mkdirSync(destinationPath);
}

function drawImages(action) {
  const startProps = { offset: 0 };
  let lines = null;

  if (action === 'lines') {
    const startY = 0.2 * options.drawing.height;
    lines = Array(options.drawing.steps)
      .fill({ x: 0, y: startY })
      .map((pt, i) => {
        const y = pt.y + (i * options.drawing.lineseparation);
        return {
          startX: -(Math.random() * 0.4 * options.drawing.width) - (0.2 * options.drawing.width),
          endX: options.drawing.width + (Math.random() * 0.4) + (0.2 * options.drawing.width),
          y,
        };
      });
  }

  for (let i = 1; i < frames + 1; i++) {
    const progress = i / frames;
    const props = { ...startProps };
    const tl = new TimelineMax();
    const imgNumber = padNumber(i, 4);

    if (action === 'spiral') {
      tl
        .to(props, options._all.duration, {
          offset: 50,
          ease: Power0.easeNone,
        }, 0)

      tl.progress(progress);
      drawSpiral(props, options.drawing, `${destinationPath}/${imgNumber}.png`);
    } else if (action === 'lines') {
      tl
        .to(props, options._all.duration, {
          offset: 200,
          ease: Power0.easeNone,
        }, 0)

      tl.progress(progress);
      drawLines(props, options.drawing, lines, `${destinationPath}/${imgNumber}.png`);
    }
  }
}
