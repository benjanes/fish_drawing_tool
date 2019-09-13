const { createCanvas } = require('canvas');
const Polyline = require('./polyline.js');
const CubicBezier = require('./cubicBezier.js');
const fs = require('fs');
const noise = require('./perlin.js');

module.exports = ({ offset }, opts, pathOut) => {
  const { width, height } = opts;
  noise.seed(opts.noiseseed);
  const center = { x: width / 2, y: height / 2 };
  const radii = Array(opts.steps).fill(opts.startingradius).map((val, i) => val + (i * opts.spiralseparation));
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  ctx.fillStyle = `rgb(${opts.bgcolor})`;
  ctx.fillRect(0, 0, width, height)

  makeThing(center, opts.fishcolor, offset, radii, ctx, opts);

  const out = fs.createWriteStream(pathOut);
  const stream = canvas.pngStream();
  stream.on('data', chunk => { out.write(chunk) });
}

function makeThing(center, rgb, offset, radii, ctx, opts) {
  const curves = radii.reduce((cs, r) => cs.concat(spiralSection(center, r, opts.spiralseparation / 4)), []);
  const adjustedPts = curves
    .reduce((pts, curve, curveIdx) => {
      const targetPoints = 26 + Math.round(curveIdx * 1.5);
      return pts.concat(adjustPoints(getPtsOnCurve(targetPoints)(curve, 0, 1), opts.displacement, opts.noiseoctave))
    }, [])
    .reduce((pts, pt, ptIdx, fullSet) => {
      if (fullSet[ptIdx - 1] && fullSet[ptIdx - 1].x == pt.x && fullSet[ptIdx - 1].y == pt.y) {
        return pts;
      }
      return pts.concat(pt);
    }, []);

  const points = adjustedPts.map((pt, i) => {
    let opacity = 0;
    let lineWidth = 0;

    const block = (i + offset) / 50;
    const diff = block - Math.floor(block);
    if (diff < 0.3) {
      lineWidth = 20;
      opacity = Math.pow((0.3 - diff) / 0.4, 4);
    }

    return { ...pt, lineWidth, opacity };
  });

  const line = new Polyline(points, ctx);
  line.draw({ isClosed: false, rgb, numSegments: 20 });
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
