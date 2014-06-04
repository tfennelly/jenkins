(function() {

    var drawFillingOrbs = function() {
        elems = document.getElementsByClassName('orb-building');
        for (var i = 0; i < elems.length; i++) {
            var elem = elems[i];
            console.log(elem);
            var canvas = document.createElement('canvas');
            canvas.className = 'doony-canvas';
            var dimension;
            if (elem.getAttribute('width') === "48" || elem.getAttribute('width') === "24") {
                // an overly large ball is scary
                dimension = elem.getAttribute('width') * 0.5 + 8;
                canvas.style.marginRight = "15px";
                canvas.style.verticalAlign = "middle";
            // XXX hack, this is for the main page job list
            } else if (elem.classList.contains("icon32x32")) {
                dimension = 24;
                canvas.style.marginTop = "4px";
                canvas.style.marginLeft = "4px";
            } else {
                dimension = elem.getAttribute('width') || 12;
            }
            canvas.setAttribute('width', dimension);
            canvas.setAttribute('height', dimension);
            var circle = new ProgressCircle({
                canvas: canvas,
                minRadius: dimension * 3 / 8 - 2,
                arcWidth: dimension / 8 + 1
            });

            var x = 0;
            circle.addEntry({
                fillColor: '#d9534f',
                progressListener: function() {
                    if (x >= 1) { x = 0; }
                    x = x + 0.005;
                    return x; // between 0 and 1
                },
            });
            circle.start(24);
            elem.parentNode.appendChild(canvas);
        }

        //// 48 -> dimension 32.
        //// radius should be 12, plus 4 width
        //// 16 -> dimension 16, radius 4

        //// jenkins does ajax every 5 seconds, this should time it perfectly
        //$(this).after(canvas).css('display', 'none');
    };

    document.addEventListener("DOMContentLoaded", function(event) {
        console.log("DOM fully loaded and parsed");
        drawFillingOrbs();
    });
})();

