(function() {

    var drawFillingOrbs = function() {
        var orbs = document.getElementsByClassName('jenkins-orb');
        for (var i = 0; i < orbs.length; i++) {
            var orb = orbs[i];
            var dimension = Math.min(orb.offsetWidth, 24);
            var orbColor = orb.getAttribute('orb-color');
            var orbAnimated = orb.getAttribute('orb-anime');

            if (!orbColor) {
                orbColor = '#ABABAB'; // Hudson Gray
            }

            storeOriginalClassSpecs(orb);
            restoreOriginalClassSpec(orb);
            removeChildElements(orb, 'canvas');

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
                orb.appendChild(canvas);
            } else {
                // Add some class info to trigger non-animated css styles...
                var orbStatus = orb.getAttribute('orb-status');
                orb.className += ' NO_ANIME ' + orbStatus;
            }
        }
    };

    function storeOriginalClassSpecs(element) {
        // Only store if it hasn't already been stored
        var originalClass = element.getAttribute('original-class');
        if (!originalClass || originalClass === '') {
            element.setAttribute('original-class', element.className);
        }
    }
    function restoreOriginalClassSpec(element) {
        // Only restore if it has already been stored
        var originalClass = element.getAttribute('original-class');
        if (originalClass && originalClass !== '') {
            element.className = originalClass;
        }
    }

    function removeChildElements(element, childElementName) {
        var childElements = element.getElementsByTagName(childElementName);
        if (childElements) {
            for (var i = 0; i < childElements.length; i++) {
                element.removeChild(childElements[i]);
            }
        }
    }

    document.addEventListener("DOMContentLoaded", function() {
        console.log("DOM fully loaded and parsed");
        drawFillingOrbs();
        layoutUpdateCallback.add(drawFillingOrbs);
    });

})();

