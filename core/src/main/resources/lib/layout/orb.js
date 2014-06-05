(function() {

    var drawOrbs = function() {
        // Some orb <img> elements are hardcoded in plugins.  Manually transforming for now.  Maybe
        // there's a better way.
        transformImgElements();

        function drawAnimatedOrb(orb, orbColor, dimension) {
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
                }
            });
            circle.start(24);
            orb.appendChild(canvas);
        }

        var orbs = document.getElementsByClassName('jenkins-orb');
        for (var i = 0; i < orbs.length; i++) {
            var orb = orbs[i];
            var dimension = Math.min(orb.offsetWidth, 36);
            var orbColor = orb.getAttribute('orb-color');
            var orbAnimated = orb.getAttribute('orb-anime');

            if (!orbColor) {
                orbColor = '#ABABAB'; // Hudson Gray
            }

            storeOriginalClassSpecs(orb);
            restoreOriginalClassSpec(orb);
            removeChildElements(orb, 'canvas');

            if (orbAnimated && orbAnimated === 'true') {
                drawAnimatedOrb(orb, orbColor, dimension);
            } else {
                // Add some class info to trigger non-animated css styles...
                var orbStatus = orb.getAttribute('orb-status');
                orb.className += ' NO_ANIME ' + orbStatus;
            }
        }
    };

    var imgSizeSet = ['16x16', '24x24', '32x32', '48x48'];
    var imgNameMap = {
        red: {animated: false, color: '#EF2929'},
        red_anime: {animated: true, color: '#EF2929'},
        yellow: {animated: false, color: '#FCE94F'},
        yellow_anime: {animated: true, color: '#FCE94F'},
        blue: {animated: false, color: '#729FCF'},
        blue_anime: {animated: true, color: '#729FCF'},
        grey: {animated: false, color: '#ABABAB'},
        grey_anime: {animated: true, color: '#ABABAB'},
        disabled: {animated: false, color: '#ABABAB'},
        disabled_anime: {animated: true, color: '#ABABAB'},
        aborted: {animated: false, color: '#ABABAB'},
        aborted_anime: {animated: true, color: '#ABABAB'},
        nobuilt: {animated: false, color: '#ABABAB'},
        nobuilt_anime: {animated: true, color: '#ABABAB'}
    };

    function transformImgElements() {
        var imgsToRemove = [];

        function transformImgElement(img) {
            if (img.hasAttribute('orb-skip')) {
                return;
            }
            img.setAttribute('orb-skip', 'yes');

            var src = img.getAttribute('src');
            var tokens = src.split('/');

            if (tokens && tokens.length >= 2) {
                var imgSize = tokens[tokens.length - 2];

                if (imgSizeSet.indexOf(imgSize) !== -1) {
                    var imgName = tokens[tokens.length - 1];
                    var extIdx = imgName.lastIndexOf('.');

                    if (extIdx !== -1) {
                        var imgNameNormalized = imgName.substr(0, extIdx);
                        var imgNameMapping = imgNameMap[imgNameNormalized];
                        if (imgNameMapping) {
                            // This is a supported orb
                            var orbDiv = document.createElement('div');
                            var status = imgNameMapping.name;

                            if (!status) {
                                status = imgNameNormalized.toUpperCase();
                            }

                            // e.g. <div class="jenkins-orb orb-size-16x16" orb-status="RED" orb-color="#123123" orb-anime="false" ></div>
                            orbDiv.className = 'jenkins-orb orb-size-' + imgSize;
                            orbDiv.setAttribute('orb-status', status);
                            orbDiv.setAttribute('orb-color', imgNameMapping.color);
                            orbDiv.setAttribute('orb-anime', imgNameMapping.animated);

                            img.parentNode.insertBefore(orbDiv, img);
                            imgsToRemove.push(img);
                        }
                    }
                }
            }
        }

        var imgs = document.getElementsByTagName('img');
        for (var i = 0; i < imgs.length; i++) {
            var img = imgs[i];
            transformImgElement(img);
        }
        for (var i = 0; i < imgsToRemove.length; i++) {
            var img = imgsToRemove[i];
            img.parentNode.removeChild(img);
        }
    }

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
        drawOrbs();
        layoutUpdateCallback.add(drawOrbs);
    });

})();

