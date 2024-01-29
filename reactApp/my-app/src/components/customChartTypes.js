import Chart from 'chart.js';

// Define a custom controller for filleted bars
Chart.controllers.roundedBar = Chart.controllers.bar.extend({
    // This method is called to draw the bars with rounded corners
    draw: function (ease) {
        const { ctx } = this.chart;
        const { chartArea } = this.chart;

        // Loop through each bar
        this.getMeta().data.forEach((bar, index) => {
            const { x, y, base, width } = bar.getProps(['x', 'y', 'base', 'width']);

            // Draw the rounded rectangle using the CanvasRenderingContext2D arcTo method
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + bar.height - 10); // Adjust the radius as needed
            ctx.arcTo(x, y + bar.height, x + width, y + bar.height, 10); // Adjust the radius as needed
            ctx.lineTo(x + width, y);
            ctx.closePath();

            // Fill the bar with the specified color
            ctx.fillStyle = bar._model.backgroundColor;
            ctx.fill();
        });
    },
});

// Register the custom chart type
Chart.controllers.roundedBar._type = 'roundedBar';
