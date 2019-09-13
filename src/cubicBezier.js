class CubicBezier {
  constructor(start, cp1, cp2, end, ctx, pts = 20) {
    this.start = start;
    this.cp1 = cp1;
    this.cp2 = cp2;
    this.end = end;
    this.ctx = ctx;
    this.points = this.findPoints(pts);
    this.length = this.findLength();
  }

  setCtx(ctx) {
    this.ctx = ctx;
  }

  withDifferentPointCount(pts) {
    return new CubicBezier(this.start, this.cp1, this.cp2, this.end, this.ctx, pts);
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.moveTo(this.start.x, this.start.y)
    this.ctx.bezierCurveTo(this.cp1.x, this.cp1.y, this.cp2.x, this.cp2.y, this.end.x, this.end.y);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  // these points are not evenly spaced, hence the algo for findPointAtDistance
  findPoints(pointCount) {
    const step = 1 / pointCount;
    const points = [];
    for (let i = 0; i <= pointCount; i++) {
      points.push({
        x: cubicDistance(i * step, this.start.x, this.cp1.x, this.cp2.x, this.end.x),
        y: cubicDistance(i * step, this.start.y, this.cp1.y, this.cp2.y, this.end.y),
      });
    }
    return points;
  }

  findLength() {
    return this.points.reduce((length, pt, idx, pts) => {
      if (!idx) {
        pt.distance = 0;
      } else {
        const prevPt = pts[idx - 1];
        const x = pt.x - prevPt.x;
        const y = pt.y - prevPt.y;
        const l = Math.sqrt(x * x + y * y);
        length += l;
        pt.distance = prevPt.distance + l;
      }
      return length;
    }, 0);
  }

  findPointAtDistance(d) {
    const targetDistance = d * this.length;
    if (!targetDistance) {
      return this.points[0]
    }
    let ptIdx = 0;

    while (this.points[ptIdx] && roundedGreaterThan(targetDistance, this.points[ptIdx].distance)) {
      ptIdx++;
    }

    const pt = this.points[ptIdx - 1];
    if (pt.distance.toFixed(3) === targetDistance) return pt;
    const subDistance = (targetDistance - pt.distance) / (this.points[ptIdx].distance - pt.distance);
    return {
      x: pt.x + ((this.points[ptIdx].x - pt.x) * subDistance),
      y: pt.y + ((this.points[ptIdx].y - pt.y) * subDistance),
    };
  }
}

function roundedGreaterThan(a, b, decimals = 2) {
  return parseFloat(a.toFixed(decimals)) > parseFloat(b.toFixed(decimals));
}

function cubicDistance(t, a, b, c, d) {
  const t2 = t * t;
  const t3 = t2 * t;
  return a + (-a * 3 + t * (3 * a - a * t)) * t
  + (3 * b + t * (-6 * b + b * 3 * t)) * t
  + (c * 3 - c * 3 * t) * t2
  + d * t3;
}

module.exports = CubicBezier;
