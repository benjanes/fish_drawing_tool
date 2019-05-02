const getCurvePoints = Symbol('getCurvePoints');
const drawLines = Symbol('drawLines');

class Polyline {
  constructor(points = [], ctx) {
    this.points = points;
    this.ctx = ctx;
  }

  setCtx(ctx) {
    this.ctx = ctx;
  }

  draw(opts) {
    this[drawLines](this[getCurvePoints](opts.isClosed, opts.tension || 0.5, opts.numSegments || 16), opts.rgb || '0,0,0', opts.fill);
  }

  [getCurvePoints](isClosed, tension, numSegments) {
    let points = [...this.points];
    const newPoints = [];

    if (isClosed) {
      points = [this.points[this.points.length - 1], this.points[this.points.length - 1]].concat(points);
      points.push(this.points[0]);
    } else {
      points.unshift(this.points[0]);
      points.push(this.points[this.points.length - 1]);
    }

    for (let i = 1; i < points.length - 2; i++) {
      let startLineWidth;
      let lineWidthStep;
      let startOpacity;
      let opacityStep;

      if (points[i].lineWidth) {
        startLineWidth = points[i].lineWidth;
        lineWidthStep = (points[i + 1].lineWidth - startLineWidth) / numSegments;
      }

      if (points[i].opacity) {
        startOpacity = points[i].opacity;
        opacityStep = (points[i + 1].opacity - startOpacity) / numSegments;
      }

      for (let t = 0; t <= numSegments; t++) {
        const t1x = (points[i + 1].x - points[i - 1].x) * tension;
        const t2x = (points[i + 2].x - points[i].x) * tension;
        const t1y = (points[i + 1].y - points[i - 1].y) * tension;
        const t2y = (points[i + 2].y - points[i].y) * tension;

        const st = t / numSegments;

        const c1 = 2 * Math.pow(st, 3) - 3 * Math.pow(st, 2) + 1;
        const c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2);
        const c3 = Math.pow(st, 3) - 2 * Math.pow(st, 2) + st;
        const c4 = Math.pow(st, 3) - Math.pow(st, 2);

        const x = c1 * points[i].x + c2 * points[i + 1].x + c3 * t1x + c4 * t2x;
        const y = c1 * points[i].y + c2 * points[i + 1].y + c3 * t1y + c4 * t2y;

        newPoints.push({
          x,
          y,
          lineWidth: startLineWidth ? startLineWidth + t * lineWidthStep : null,
          opacity: startOpacity ? startOpacity + t * opacityStep : null,
        });
      }
    }
    return newPoints;
  }

  [drawLines](pts, rgb, fill) {
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = `rgb(${rgb})`;

    // only do the fill part in this step
    if (fill) {
      this.ctx.beginPath();
      this.ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) {
        this.ctx.lineTo(pts[i].x, pts[i].y);
      }

      this.ctx.fillStyle = fill;
      this.ctx.fill();
      this.ctx.closePath();
    }

    // two iterations, but this allows for drawing a "variant width" stroke over the filled polygon
    for (let i = 1; i < pts.length; i++) {
      if (pts[i].lineWidth) this.ctx.lineWidth = pts[i].lineWidth;
      if (pts[i].opacity) {
        this.ctx.strokeStyle = `rgb(${rgb},${pts[i].opacity.toFixed(3)})`;
      }

      this.ctx.beginPath();
      this.ctx.moveTo(pts[i - 1].x, pts[i - 1].y)
      this.ctx.lineTo(pts[i].x, pts[i].y);
      this.ctx.stroke();
      this.ctx.closePath();
    }
  }
}
