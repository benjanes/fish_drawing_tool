const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const width = canvas.offsetWidth * 4;
const height = canvas.offsetHeight * 4;
canvas.width = width;
canvas.height = height;

// const strokeRGB = '0,100,200';
const strokeRGB = '255,255,0';
const bgColor = 'rgb(30,30,30)';
ctx.lineWidth = 6;
ctx.lineCap = 'round';
ctx.fillStyle = bgColor;
ctx.strokeStyle = `rgb(${strokeRGB})`;

const lineWidthOctave = 10;
const minLineWidth = 10;
const lineWidthMagnitude = 16;

const x1 = width * 0.45; // left side of the fish "body"
const x2 = width * 0.1; // right side of the fish "body" (tip of the nose)
const midY = height * 0.5; // center point in y dimension

const cpDiff = 0.4; // determines x of control points for fish body curvature
const cpYDiff = 0.35; // determines y of control points for fish body curvature

const headSpace = 0.05; // how far back from nose should scales start? proportion of the body's curve
const tailSpace = 0.07; // how far back from body's end should tail start? proportion of the body's curve
const scaleRowCount = 20; // how many scale rows
const ptsOnScale = 12; // how many points used to build a scale's Polyline

const tailLines = 60; // how many lines used to draw the tail
const finLines = 40; // how many lines used to draw top and bottom fins

const topFinStart = 0.1; // starting point of top fin, proportion of body's curve
const topFinEnd = 0.4; // ending point of top fin, proportion of body's curve

const btmFinStart = 0.1; // starting point of bottom fin, proportion of body's curve
const btmFinEnd = 0.4; // ending point of bottom fin, proportion of body's curve

const scaleRowCurvature = -0.9; // further from 0 is curvier rows
const scaleRelativeDimension = 2; // scale "radius" as a proportion of the distance between rows
const curvinessRelativeToLength = 2;

const curveTop = new CubicBezier({ x: x1, y: midY }, { x: x1 + cpDiff * width, y: midY - cpYDiff * height }, { x: x2 - cpDiff * width, y: midY - cpYDiff * height }, { x: x2, y: midY }, ctx);
const curveBtm = new CubicBezier({ x: x1, y: midY }, { x: x1 + cpDiff * width, y: midY + cpYDiff * height }, { x: x2 - cpDiff * width, y: midY + cpYDiff * height }, { x: x2, y: midY }, ctx);
const scaleBaseDimension = (1 - headSpace - tailSpace) * (1 / scaleRowCount) * scaleRelativeDimension * curveTop.length;
const scaleRows = Array(scaleRowCount).fill(null).map((_, i) => makeScaleRow(i));

const lineCount = 150;

// bring the NOISE
noise.seed(Math.random());

ctx.fillRect(0, 0, width, height);

drawStarburst({ x: midY, y: midY }, 600)

function drawStarburst(ctr, radius) {

  const arcs = [0, 1, 2, 3].map(createArc(ctr, radius));
  arcs.forEach((arc, idx) => {
    // arc.draw({ rgb: strokeRGB })
    if (idx === 0) {
      drawLinesOffArc(arc.points, { min: 1800, max: 0 }, { min: Math.PI * 6, max: Math.PI * -1.5 }, linearAdjust(0.5), linearAdjust(0.5), '250,250,0', 0.04)
    } else if (idx === 1) {
      drawLinesOffArc(arc.points, { min: 1800, max: 0 }, { min: Math.PI * 4, max: Math.PI * -0.5 }, linearAdjust(0.5), linearAdjust(1), '240,100,0', 0.06)
    } else if (idx === 2) {
      drawLinesOffArc(arc.points, { min: 1800, max: 0 }, { min: Math.PI * 5, max: Math.PI * -2.5 }, linearAdjust(0.5), linearAdjust(0.5), '250,250,0', 0.04)
    } else {
      drawLinesOffArc(arc.points, { min: 1800, max: 0 }, { min: Math.PI * 3, max: Math.PI * -1.5 }, linearAdjust(0.5), linearAdjust(1), '240,100,0', 0.06)
    }
  });
}

function createArc({ x, y }, r) {
  return (i) => {
    let start, cp1, cp2, end;
    const c = r * 0.551915;
    if (i === 0) {
      start = { x, y: y + r };
      cp1 = { x: x + c, y: y + r };
      cp2 = { x: x + r, y: y + c };
      end = { x: x + r, y };
    } else if (i === 1) {
      start = { x: x + r, y };
      cp1 = { x: x + r, y: y - c };
      cp2 = { x: x + c, y: y - r };
      end = { x, y: y - r };
    } else if (i === 2) {
      start = { x, y: y- r };
      cp1 = { x: x - c, y: y - r };
      cp2 = { x: x - r, y: y - c };
      end = { x: x - r, y };
    } else {
      start = { x: x - r, y  };
      cp1 = { x: x - r, y: y + c };
      cp2 = { x: x - c, y: y + r };
      end = { x, y: y + r };
    }
    return (new CubicBezier(start, cp1, cp2, end, ctx)).withDifferentPointCount(lineCount);
  }
}

function drawLinesOffArc(points, lengthRange, angleRange, lengthAdjust, angleAdjust, stroke, opacity) {
  for (let i = 0; i < points.length; i++) {
    const length = lengthAdjust(i, points.length, lengthRange);
    const angle = angleAdjust(i, points.length, angleRange);
    const pointToRotate = { x: points[i].x + length, y: points[i].y };
    const endPoint = rotatePoint(pointToRotate, angle, points[i]);

    const line = new CubicBezier(points[i], points[i], endPoint, endPoint, ctx);

    const randomLineWidthRefCoord = Math.random() * 1000;
    const randomOpacityRefCoord = Math.random() * 1000;

    const linePoints = /*adjustPoints(line.points, 20, 200)*/line.points.map((pt, i) => {
      const lineWidthAdjust = noise.simplex2(randomLineWidthRefCoord + (i * 10) / lineWidthOctave, randomLineWidthRefCoord + (i * 10) / lineWidthOctave);
      // const opacityAdjust = noise.simplex2(randomOpacityRefCoord + (i * 40) / 300, randomOpacityRefCoord + (i * 40) / 300);
      //
      const lineWidth = (lineWidthAdjust * lineWidthMagnitude) + (lineWidthMagnitude + minLineWidth);
      // const opacity = Math.pow((opacityAdjust + 1) / 2, 8);
      return { ...pt, lineWidth, opacity };
    });
    const adjustedLine = new Polyline(linePoints, ctx);
    adjustedLine.draw({ isClosed: false, rgb: stroke });
    // finLine.draw();
    //
    // ctx.beginPath();
    // ctx.moveTo(points[i].x, points[i].y);
    // ctx.lineTo(endPoint.x, endPoint.y);
    // ctx.stroke();
    // ctx.closePath();
  }
}

// drawFishy();
/*
  Drawing Fns
*/
function drawFishy() {
  ctx.fillRect(0, 0, width, height);
  // drawTail();
  // drawHead();
  drawTopFin();
  drawBtmFin();

  scaleRows.reverse();
  scaleRows.forEach((row) => {
    row.scales.forEach(drawScale);
  });
}

function drawScale(scale) {
  const angleStep = Math.PI * (1 / (ptsOnScale - 1));
  const randomLineWidthRefCoord = Math.random() * 1000;
  const randomOpacityRefCoord = Math.random() * 1000;

  const points = Array(ptsOnScale).fill(null).map((_, i) => {
    const angle = -angleStep * i;

    const refPoint = rotatePoint(scale.top, angle, scale.center);
    const adjustment = noise.simplex2(refPoint.x / 300, refPoint.y / 300);
    const adjustedPt = adjustPointRelativeToPointOfRotation(refPoint, scale.center, adjustment, 0.6);

    const lineWidthAdjust = noise.simplex2(randomLineWidthRefCoord + (i * 10) / lineWidthOctave, randomLineWidthRefCoord + (i * 10) / lineWidthOctave);
    const opacityAdjust = noise.simplex2(randomOpacityRefCoord + (i * 40) / 300, randomOpacityRefCoord + (i * 40) / 300);

    const lineWidth = (lineWidthAdjust * lineWidthMagnitude) + (lineWidthMagnitude + minLineWidth);
    const opacity = Math.pow((opacityAdjust + 1) / 2, 10);

    return { ...adjustedPt, lineWidth, opacity };
  });

  const line = new Polyline(points, ctx);
  // const c = Math.floor(Math.random() * 255);
  // console.log(blueness)
  // line.draw({ fill: bgColor, rgb: `0,0,${blueness}` });
  line.draw({ /*fill: bgColor,*/ rgb: '255,0,0' });
}

function adjustPointRelativeToPointOfRotation(p, center, adjustment, adjustmentFactor) {
  return {
    x: ((p.x - center.x) * (1 + (adjustment * adjustmentFactor))) + center.x,
    y: ((p.y - center.y) * (1 + (adjustment * adjustmentFactor))) + center.y,
  };
}

function makeScaleRow(idx) {
  const proportionalDist = 1 - (headSpace + ((idx - 1) / (scaleRowCount)) * (1 - headSpace - tailSpace));
  const topPt = curveTop.findPointAtDistance(proportionalDist);
  const btmPt = curveBtm.findPointAtDistance(proportionalDist);
  // curvinessRelativeToLength keeps curviness relative to the length of the row. bump this value up for curvier.
  const x = topPt.x - ((scaleRowCurvature * (x1 - x2) / 0.5) * ((btmPt.y - topPt.y) / height * curvinessRelativeToLength));
  const curve = new CubicBezier(topPt, { x, y: topPt.y + (scaleRowCurvature * (x2 - x1) * 0.1) }, { x, y: btmPt.y - (scaleRowCurvature * (x2 - x1) * 0.1) }, btmPt, ctx);

  const adjust = idx % 2 ? Math.ceil : Math.floor;
  const rowScaleCount = adjust(curve.length / (scaleBaseDimension * 2));
  const scaleDimension = curve.length / rowScaleCount;
  const scaleStep = scaleDimension / curve.length;

  const scalePoints = [];
  for (let i = 0; i <= rowScaleCount; i++) {
    scalePoints.push(curve.findPointAtDistance(i * scaleStep));
  }

  const scales = scalePoints.reduce((scales, pt, idx, pts) => {
    if (idx) {
      const center = findCenter(pts[idx - 1], pt);
      scales.push({ center, top: pts[idx - 1] });
    }
    return scales;
  }, []);

  return {
    curve,
    scaleDimension,
    scales,
  };
}

function drawHead() {
  // popping and/or shifting gives a bit more control over the points used to draw the head.
  // the only really necesssary array manipulation is the pop on the topPts array. otherwise get an extra pointy snout.
  const topPts = adjustPoints(getPtsOnCurve(20)(curveTop, 1, 1 - headSpace), 6, 300);
  // topPts.shift();
  topPts.pop();
  const btmPts = adjustPoints(getPtsOnCurve(20)(curveBtm, 1 - headSpace, 1), 6, 300);
  // btmPts.pop();

  const randomLineWidthRefCoord = Math.random() * 1000;
  const randomOpacityRefCoord = Math.random() * 1000;

  const points = topPts.concat(btmPts).map((pt, i) => {
    const lineWidthAdjust = noise.simplex2(randomLineWidthRefCoord + (i * 10) / lineWidthOctave, randomLineWidthRefCoord + (i * 10) / lineWidthOctave);
    const opacityAdjust = noise.simplex2(randomOpacityRefCoord + (i * 10) / 200, randomOpacityRefCoord + (i * 10) / 200);

    const lineWidth = (lineWidthAdjust * lineWidthMagnitude) + (lineWidthMagnitude + minLineWidth);
    const opacity = Math.pow((opacityAdjust + 1) / 2, 0.9);
    return { ...pt, lineWidth, opacity };
  })

  const headLine = new Polyline(points, ctx);
  headLine.draw({ isClosed: false, rgb: strokeRGB });
}

function drawTail() {
  // const topPt = curveTop.findPointAtDistance(tailSpace);
  // const btmPt = curveBtm.findPointAtDistance(tailSpace);
  // const x = topPt.x - ((scaleRowCurvature * (x1 - x2) / 0.5) * ((btmPt.y - topPt.y) / height * curvinessRelativeToLength));
  // const curve = new CubicBezier(topPt, { x, y: topPt.y + (scaleRowCurvature * (x2 - x1) * 0.1) }, { x, y: btmPt.y - (scaleRowCurvature * (x2 - x1) * 0.1) }, btmPt, ctx, tailLines);
  const curve = scaleRows[0].curve.withDifferentPointCount(tailLines);
  // console.log(curve);
  drawFin(curve.points, { min: 400, max: 400 }, { min: -Math.PI * 1, max: Math.PI * 1 }, midPointMinimumAdjust(2), linearAdjust(1));
}

function drawTopFin() {
  const points = getPtsOnCurve(finLines)(curveTop, topFinStart, topFinEnd);
  drawFin(points, { min: 450, max: 600 }, { /*min: Math.PI * 2.62, max: Math.PI * 0.7*/ min: Math.PI * 0, max: Math.PI * 1 }, linearAdjust(0.1), linearAdjust(1));
}

function drawBtmFin() {
  const points = getPtsOnCurve(finLines)(curveBtm, btmFinStart, btmFinEnd);
  drawFin(points, { min: 400, max: 800 }, { min: Math.PI * 0, max: Math.PI * 1 }, linearAdjust(0.4), linearAdjust(1));
}

// a range is of type { min: number, max: number }
// adjust fns map a point index to a range
function drawFin(points, lengthRange, angleRange, lengthAdjust, angleAdjust) {
  for (let i = 0; i < points.length; i++) {
    const length = lengthAdjust(i, points.length, lengthRange);
    const angle = angleAdjust(i, points.length, angleRange);
    const pointToRotate = { x: points[i].x + length, y: points[i].y };
    const endPoint = rotatePoint(pointToRotate, angle, points[i]);

    const finLine = new CubicBezier(points[i], points[i], endPoint, endPoint, ctx);

    const randomLineWidthRefCoord = Math.random() * 1000;
    const randomOpacityRefCoord = Math.random() * 1000;

    const finPoints = adjustPoints(finLine.points, 20, 200).map((pt, i) => {
      const lineWidthAdjust = noise.simplex2(randomLineWidthRefCoord + (i * 10) / lineWidthOctave, randomLineWidthRefCoord + (i * 10) / lineWidthOctave);
      const opacityAdjust = noise.simplex2(randomOpacityRefCoord + (i * 40) / 300, randomOpacityRefCoord + (i * 40) / 300);

      const lineWidth = (lineWidthAdjust * lineWidthMagnitude) + (lineWidthMagnitude + minLineWidth);
      const opacity = Math.pow((opacityAdjust + 1) / 2, 5);
      return { ...pt, lineWidth, opacity };
    });
    const fin = new Polyline(finPoints, ctx);
    fin.draw({ isClosed: false, rgb: strokeRGB });
    // finLine.draw();
    //
    // ctx.beginPath();
    // ctx.moveTo(points[i].x, points[i].y);
    // ctx.lineTo(endPoint.x, endPoint.y);
    // ctx.stroke();
    // ctx.closePath();
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

function rotatePoint(point, angle, center) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const deltaX = point.x - center.x;
  const deltaY = point.y - center.y;
  const x = (cos * deltaX) - (sin * deltaY) + center.x;
  const y = (cos * deltaY) + (sin * deltaX) + center.y;
  return { x, y };
}

function findCenter(p1, p2) {
  return {
    x: ((p1.x - p2.x) / 2) + p2.x,
    y: ((p1.y - p2.y) / 2) + p2.y,
  }
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

function midPointMinimumAdjust(factor) {
  return (idx, pointCount, range) => {
    const proportion = idx / (pointCount - 1);
    const adjustedProportion = Math.abs(0.5 - proportion);

    return Math.pow((adjustedProportion) / 0.5, factor) * (range.max - range.min) + range.min;
  };
}

function linearAdjust(factor) {
  return (idx, pointCount, range) => {
    const proportion = idx / (pointCount - 1);

    return Math.pow((proportion), factor) * (range.max - range.min) + range.min;
  };
}
