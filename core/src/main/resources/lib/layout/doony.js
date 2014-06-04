(function() {

    var drawFillingOrbs = function() {
        elems = document.getElementsByClassName('orb-building');
        console.log(elems);
        //var canvas = document.createElement('canvas');
        //canvas.className = 'doony-canvas';

        //// 48 -> dimension 32.
        //// radius should be 12, plus 4 width
        //// 16 -> dimension 16, radius 4
        //var dimension;
        //if (this.getAttribute('width') === "48" || this.getAttribute('width') === "24") {
            //// an overly large ball is scary
            //dimension = this.getAttribute('width') * 0.5 + 8;
            //canvas.style.marginRight = "15px";
            //canvas.style.verticalAlign = "middle";
        //// XXX hack, this is for the main page job list
        //} else if (this.classList.contains("icon32x32")) {
            //dimension = 24;
            //canvas.style.marginTop = "4px";
            //canvas.style.marginLeft = "4px";
        //} else {
            //dimension = this.getAttribute('width') || 12;
        //}
        //canvas.setAttribute('width', dimension);
        //canvas.setAttribute('height', dimension);

        //var circle = new ProgressCircle({
            //canvas: canvas,
            //minRadius: dimension * 3 / 8 - 2,
            //arcWidth: dimension / 8 + 1
        //});

        //var x = 0;
        //circle.addEntry({
            //fillColor: color,
            //progressListener: function() {
                //if (x >= 1) { x = 0; }
                //x = x + 0.005;
                //return x; // between 0 and 1
            //},
        //});
        //// jenkins does ajax every 5 seconds, this should time it perfectly
        //circle.start(24);
        //$(this).after(canvas).css('display', 'none');
    };

    setInterval(function() {
        drawFillingOrbs();
    }, 10);
)();

