import Chart from 'chart.js';

// Override the draw method of the Bar chart element
Chart.elements.Rectangle.prototype.draw = function () {
    const ctx = this._chart.ctx;
    const vm = this._view;
    const left = vm.x - vm.width / 2;
    const right = vm.x + vm.width / 2;
    const top = vm.y;
    const bottom = vm.base;
    const cornerRadius = 6; // Adjust as needed
  
    ctx.beginPath();
    ctx.fillStyle = vm.backgroundColor;
    ctx.strokeStyle = vm.borderColor;
    ctx.lineWidth = vm.borderWidth;
  
    // Rounded top
  ctx.moveTo(left + cornerRadius, top);
  ctx.lineTo(right - cornerRadius, top);
  ctx.quadraticCurveTo(right, top, right, top + cornerRadius);
  ctx.lineTo(right, bottom - cornerRadius);
  ctx.quadraticCurveTo(right, bottom, right - cornerRadius, bottom);
  ctx.lineTo(left + cornerRadius, bottom);
  ctx.quadraticCurveTo(left, bottom, left, bottom - cornerRadius);
  ctx.lineTo(left, top + cornerRadius);
  ctx.quadraticCurveTo(left, top, left + cornerRadius, top);
  ctx.closePath();
  
    ctx.fill();
    if (vm.borderWidth) {
      ctx.stroke();
    }
  };
  