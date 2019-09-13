const { createCanvas } = require('canvas');
const Polyline = require('./polyline.js');
const CubicBezier = require('./cubicBezier.js');
const fs = require('fs');
const noise = require('./perlin.js');

module.exports = ({ offset }, opts, lines, pathOut) => {
  const { width, height } = opts;
  noise.seed(opts.noiseseed);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  ctx.lineWidth = 10;
  ctx.fillStyle = `rgb(${opts.bgcolor})`;
  ctx.fillRect(0, 0, width, height)

  makeThing(opts, offset, lines, ctx);

  const out = fs.createWriteStream(pathOut);
  const stream = canvas.pngStream();
  stream.on('data', chunk => { out.write(chunk) });
}

function makeThing(opts, offset, lines, ctx) {
  lines
    .map(line => {
      const pts = [];
      for (let x = line.startX; x <= line.endX; x += opts.fidelity) {
        const adjustment = noise.simplex2(x / opts.noiseoctave, line.y / opts.noiseoctave);
        let opacity = 0;
        let lineWidth = 0;
        const block = (x + offset - line.startX) / 200;
        const diff = block - Math.floor(block);

        if (diff < 0.4) {
          lineWidth = 16;
          opacity = Math.pow((0.4 - diff) / 0.5, 4);
        }

        pts.push({
          x: x + (adjustment * opts.displacement),
          y: line.y + (adjustment * opts.displacement),
          lineWidth,
          opacity,
        });
      }
      return pts;
    })
    .forEach(line => {
      const polyline = new Polyline(line, ctx);
      polyline.draw({ isClosed: false, rgb: opts.fishcolor });
    });
}

function spiralSection(center, r, expand) {
  return [0,1,2,3].map(createArc(center, r, expand));
}

function createArc({ x, y }, r, expandBy, ctx) {
  return (i) => {
    let start, cp1, cp2, end;
    const startR = r + (expandBy * i);
    const endR = startR + expandBy;
    const c1 = startR * 0.551915;
    const c2 = endR * 0.551915;

    if (i === 0) {
      end = { x, y: y + startR };
      cp2 = { x: x + c1, y: y + startR };
      cp1 = { x: x + endR, y: y + c2 };
      start = { x: x + endR, y };
    } else if (i === 1) {
      end = { x: x + startR, y };
      cp2 = { x: x + startR, y: y - c1 };
      cp1 = { x: x + c2, y: y - endR };
      start = { x, y: y - endR };
    } else if (i === 2) {
      end = { x, y: y - startR };
      cp2 = { x: x - c1, y: y - startR };
      cp1 = { x: x - endR, y: y - c2 };
      start = { x: x - endR, y };
    } else {
      end = { x: x - startR, y  };
      cp2 = { x: x - startR, y: y + c1 };
      cp1 = { x: x - c2, y: y + endR };
      start = { x, y: y + endR };
    }

    return new CubicBezier(start, cp1, cp2, end, ctx);
  }
}

/*
  Utility Fns
*/
function adjustPoints(pts, degreeOfChange = 5, octave = 400) {
  return pts.map(pt => {
    const adjustment = noise.simplex2(pt.x / octave, pt.y / octave);
    return {
      ...pt,
      x: pt.x + (adjustment * degreeOfChange),
      y: pt.y + (adjustment * degreeOfChange),
    }
  })
}

function getPtsOnCurve(numberOfPts) {
  return (curve, start, end) => {
    // use some subset of points from curve
    const points = [];
    for (let i = 0; i < numberOfPts; i++) {
      const proportion = i / (numberOfPts - 1);
      const distance = (start - end) * proportion + end;
      points.push(curve.findPointAtDistance(distance));
    }
    return points;
  };
}
