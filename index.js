/*
  goal: make a circle around a point.
    - for that point, can either:
        A) have a fixed radius, for each rotation step around the point, check the noise at that actual point.
            use that noise level to push the point in or out off of the baseline radius.
        B) do something similar to A but use noise values along 1-d based on distance traveled around the circle's
            arc. this would not give a finished position equal to start position. but probably close anyway?
    - also want to include varied line width by point on the path
    - have a max and min line width for any given circle -- this can be used to determine opacity as well. wider
        sections should be relatively darker
*/

const rotateFixed = (distance, angle, center) => {
  return { x: (Math.cos(angle) * distance) + center.x, y: (Math.sin(angle) * distance) + center.y, distance, angle };
};

(function() {
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const width = canvas.offsetWidth * 4;
	const height = canvas.offsetHeight * 4;
	canvas.width = width;
	canvas.height = height;

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2;

  const maxR = 5;
  const circlePoints = 20;
  const baseLineWidth = 100;
  const angleStep = Math.PI / 19;

  noise.seed(Math.random());

  for (let i = 0; i < 50; i++) {
    const circle = makeCircle(centerX, centerY, (maxR + i * 10), angleStep * i);
    const rgb = i % 2 ? '255,60,60' : '255,200,50';
    circle.draw({ rgb, isClosed: true, numSegments: 30, tension: 0.5 })
  }


  function makeCircle(x, y, r, startAngle) {
    console.log(startAngle)
    const points = [];
    const randomCoord = Math.random() * 1000;
    for (let i = 0; i < circlePoints; i++) {
      const angle = (Math.PI * 2 * (i / circlePoints)) + startAngle;
      // if this looks weird, use a random point (within fn not within loop) instead of passed in x and y to get refPoint
      const refPoint = rotateFixed(r, angle, { x, y });
      // denominators of 600+ look about right for distance
      const distanceAdjust = noise.simplex2(refPoint.x / 500, refPoint.y / 500);
      const lineWidthAdjust = noise.simplex2(refPoint.x / 2000, refPoint.y / 2000);
      const opacityAdjust = noise.simplex2((randomCoord + i * 2) / 150, randomCoord / 150);

      const distance = r + (r * distanceAdjust / 2);
      const lineWidth = baseLineWidth + (baseLineWidth * lineWidthAdjust);
      const opacity = Math.pow((opacityAdjust + 1) / 2, 20);

      points.push({ ...rotateFixed(distance, angle, { x, y }), lineWidth, opacity });
    }
    return new Polyline(points, ctx);
  }

  // function drawCircle(pts) {
  //   pts.forEach(pt => {
  //     ctx.fillRect(pt.x, pt.y, 4, 4);
  //   });
  // }



  // const steps = 60;
  //
  // const step = 1 / steps;
  // const lineVals = [];
  //
  // for (let i = 0; i < steps; i++) {
  //   lineVals.push(i * step);
  // }
  //
  //
  // const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
  //
  // for (let x = -200; x < width; x += 6) {
  //   for (let y = 0; y < width; y++) {
  //     const val = (1 + noise.simplex2(x / 400, y / 400)) / 2;
  //     const opacity = (1 + val) / 2;
  //     const correction = (Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)) / maxDistance);
  //     // const correction = x / width;
  //
  //     // ctx.fillStyle = `rgba(0,0,0,${Math.pow(Math.abs(val * Math.pow(correction, 1)), 4)})`
  //     ctx.fillStyle = `rgba(0,0,0,1)`
  //     // ctx.fillRect(x + (val * 600 * Math.pow(correction, 1)), y, 2, 2);
  //     ctx.fillRect(x + (val * 600 * Math.pow(correction, 1)), y, 2, 2);
  //
  //   }
  // }
})();
