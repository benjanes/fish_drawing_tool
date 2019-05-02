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

  ctx.fillStyle = 'rgb(25,25,40)';
  ctx.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2;

  const maxR = 5;
  // const circlePoints = 20;
  const baseLineWidth = 200;
  const angleStep = Math.PI / 19;

  const gridCount = 22;

  const circleStep = width / gridCount;
  const circleR = (circleStep / 2) * 1;

  noise.seed(Math.random());

  const circles = [];

  for (let col = -1; col <= gridCount; col++) {
    // const rgb = `${parseInt(Math.random() * 255)},${parseInt(Math.random() * 255)},${parseInt(Math.random() * 255)}`;
    // const rgb = col % 2 ? '255,200,80' : '255,100,100';
    // const rgb = '255,220,60';
    for (let row = -1; row <= gridCount; row++) {
      const circleCount = Math.round(Math.random() * 10) - 5;
      const x = col * circleStep + circleR;
      const y = row * circleStep + (col % 2 ? circleR : 0);

      const colorAdjust = noise.simplex2(x / 550, y / 550);
      // const color = Math.floor(((colorAdjust + 1) / 2) * 200) + 55;
      // const rgb = `${color},${color},${color}`
      // const rgb = colorAdjust > 0 ? '255,200,80' : '255,100,100';


      if (circleCount < 0) {
        for (let i = circleCount; i <= 0; i++) {
          // const randomColor = Math.floor(Math.random() * 255);
          // const rgb = `${randomColor},${randomColor},${randomColor}`
          // const rgb = Math.round(Math.random()) ? '255,255,255' : '0,0,0';
          // const rgb = Math.round(Math.random()) ? '255,200,80' : '255,100,100';
          // const rgb = '255,100,100';

          const rgb = `${parseInt(Math.random() * 255)},${parseInt(Math.random() * 255)},${parseInt(Math.random() * 255)}`;
          const circle = makeCircle(x, y, circleR + (i * (16)), Math.random() * Math.PI * 2, Math.round(Math.random() * 10) + 10);
          circles.push(circle.draw.bind(circle, { rgb, isClosed: true }));
          // circle.draw({ rgb, isClosed: true/*!!Math.round(Math.random())*/, numSegments: 30 });
        }
      } else {
        for (let i = circleCount; i >= 0; i--) {
          // const randomColor = Math.floor(Math.random() * 255);
          // const rgb = `${randomColor},${randomColor},${randomColor}`
          // const rgb = Math.round(Math.random()) ? '255,255,255' : '0,0,0';
          // const rgb = Math.round(Math.random()) ? '255,200,80' : '255,100,100';

          const rgb = `${parseInt(Math.random() * 255)},${parseInt(Math.random() * 255)},${parseInt(Math.random() * 255)}`;
          // const rgb = '255,120,80'
          const circle = makeCircle(x, y, circleR + (i * (16)), Math.random() * Math.PI * 2, Math.round(Math.random() * 10) + 10);
          circles.push(circle.draw.bind(circle, { rgb, isClosed: false }));

          // circle.draw({ rgb, isClosed: !!Math.round(Math.random()), numSegments: 30 });
        }
      }
    }
    // const circle = makeCircle(centerX, centerY, (maxR + i * 10), angleStep * i);
    // const rgb = i % 2 ? '255,60,60' : '255,200,50';
    // circle.draw({ rgb, isClosed: true, numSegments: 30, tension: 0.5 })
  }

  while (circles.length) {
    const randomIdx = Math.floor(circles.length * Math.random());
    circles.splice(randomIdx, 1)[0]();
    // console.log(circles.length);
  }

  function makeCircle(x, y, r, startAngle, circlePoints) {
    const points = [];
    const randomCoord = Math.random() * 1000;
    for (let i = 0; i < circlePoints; i++) {
      const angle = (Math.PI * 2 * (i / circlePoints)) + startAngle;
      // if this looks weird, use a random point (within fn not within loop) instead of passed in x and y to get refPoint
      const refPoint = rotateFixed(r, angle, { x, y });
      // denominators of 600+ look about right for distance
      const distanceAdjust = noise.simplex2(refPoint.x / 150, refPoint.y / 150);
      // const lineWidthAdjust = noise.simplex2(refPoint.x / 100, refPoint.y / 100);
      const lineWidthAdjust = noise.simplex2((randomCoord + i * 4) / 100, (randomCoord + i * 4) / 100);
      const opacityAdjust = noise.simplex2((randomCoord + i * 2) / 500, randomCoord / 500);

      const distance = r + (r * distanceAdjust / 2);
      const lineWidth = Math.max(baseLineWidth + (baseLineWidth * lineWidthAdjust), 4);
      const opacity = Math.max(Math.pow((opacityAdjust + 1) / 2, 40), 0);

      points.push({ ...rotateFixed(distance, angle, { x, y }), lineWidth, opacity });
    }
    return new Polyline(points, ctx);
  }
})();
