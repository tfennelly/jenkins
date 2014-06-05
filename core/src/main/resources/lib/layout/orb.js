(function() {

    var drawFillingOrbs = function() {
        elems = document.getElementsByClassName('jenkins-orb');
        for (var i = 0; i < elems.length; i++) {
            var elem = elems[i];
            var dimension = Math.min(elem.offsetWidth, 24);
            var orbColor = elem.getAttribute('orb-color');
            var orbAnimated = elem.getAttribute('orb-anime');

            if (!orbColor) {
                orbColor = '#ABABAB'; // Hudson Gray
            }

            if (orbAnimated && orbAnimated === 'true') {
                var canvas = document.createElement('canvas');

                canvas.className = 'orb-canvas';
                canvas.setAttribute('width', dimension);
                canvas.setAttribute('height', dimension);
                var circle = new ProgressCircle({
                    canvas: canvas,
                    minRadius: dimension * 3 / 8 - 2,
                    arcWidth: dimension / 8 + 1
                });

                var x = 0;
                circle.addEntry({
                    fillColor: orbColor,
                    progressListener: function() {
                        if (x >= 1) {
                            x = 0;
                        }
                        x = x + 0.005;
                        return x; // between 0 and 1
                    },
                });
                circle.start(24);
                elem.appendChild(canvas);
            } else {
                // Add some class info to trigger non-animated css styles...
                var orbStatus = elem.getAttribute('orb-status');
                elem.className += ' NO_ANIME ' + orbStatus;
            }
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

