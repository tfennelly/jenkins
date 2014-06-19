(function() {

    var drawIcons = function() {
        var icons = document.getElementsByClassName('jenkins-icon');
        for (var i = 0; i < icons.length; i++) {
            var icon = icons[i];
            drawIcon(icon);
        }
    };

    function drawIcon(icon) {
        var dimension = Math.min(icon.offsetWidth, 36);
        var iconName = icon.getAttribute('icon-name');

        if (!iconName) {
            return;
        }

        var imgMapEntry = statusIconMap[iconName.toLowerCase()];

        if (!imgMapEntry) {
            return;
        }

        storeOriginalClassSpecs(icon);
        restoreOriginalClassSpec(icon);
        removeChildElements(icon, 'canvas');

        if (imgMapEntry.animated) {
            drawAnimatedIcon(icon, dimension, imgMapEntry);
        } else {
            // Add some class info to trigger non-animated css styles...
            icon.className += ' NO_ANIME';
            applyStaticIconStyle(icon, imgMapEntry);
        }
    }

    function drawAnimatedIcon(icon, dimension, imgMapEntry) {
        var canvas = document.createElement('canvas');
        var iconColor = imgMapEntry.color;

        canvas.className = 'icon-canvas';
        canvas.setAttribute('width', dimension);
        canvas.setAttribute('height', dimension);
        var circle = new ProgressCircle({
            canvas: canvas,
            minRadius: dimension * 3 / 8 - 2,
            arcWidth: dimension / 8 + 1
        });

        var x = 0;
        circle.addEntry({
            fillColor: iconColor,
            progressListener: function() {
                if (x >= 1) {
                    x = 0;
                }
                x = x + 0.005;
                return x; // between 0 and 1
            }
        });
        circle.start(24);
        icon.appendChild(canvas);
    }

    /**
     * We are applying the style here in JS (Vs CSS) because we need to maintain a color map anyway
     * (for the animated progressive icon) here in the JS, which means there's no point in also maintaining
     * color styles in the CSS.
     */
    function applyStaticIconStyle(icon, imgMapEntry) {
        var style = STATIC_ORB_STYLE_TEMPLATE;

        style = style.replace(/@background@/g, imgMapEntry.color.stop2);
        style = style.replace(/@stop1@/g, imgMapEntry.color.stop1);
        style = style.replace(/@stop2@/g, imgMapEntry.color.stop2);

        icon.setAttribute('style', style);
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
        drawIcons();
        layoutUpdateCallback.add(drawIcons);
    });

    var statusIconMap = {
        red: {
            animated: false,
            color: {
                stop1: '#F69E9E',
                stop2: '#9E1010'
            }
        },
        red_anime: {
            animated: true,
            color: '#9E1010'
        },
        yellow: {
            animated: false,
            color: {
                stop1: '#FCCC4F',
                stop2: '#D54214'
            }
        },
        yellow_anime: {
            animated: true,
            color: '#D54214'
        },
        blue: {
            animated: false,
            color: {
                stop1: '#79B1E9',
                stop2: '#3269A0'
            }
        },
        blue_anime: {
            animated: true,
            color: '#3269A0'
        },
        grey: {
            animated: false,
            color: {
                stop1: '#ECECEC',
                stop2: '#8B8B8B'
            }
        },
        grey_anime: {
            animated: true,
            color: '#8B8B8B'
        }
    };
    statusIconMap.disabled = statusIconMap.grey;
    statusIconMap.disabled_anime = statusIconMap.grey_anime;
    statusIconMap.aborted = statusIconMap.grey;
    statusIconMap.aborted_anime = statusIconMap.grey_anime;
    statusIconMap.nobuilt = statusIconMap.grey;
    statusIconMap.nobuilt_anime = statusIconMap.grey_anime;

    // Name mismatch in BallColor.java - enum is "NOTBUILT" while image name prefix is "nobuilt"
    statusIconMap.notbuilt = statusIconMap.nobuilt;
    statusIconMap.notbuilt_anime = statusIconMap.nobuilt_anime;

    // Expand the status icon name map to support status icon names that include dimensions.
    var statusIconDimensions = ['16x16', '24x24', '32x32', '48x48'];
    var statusIconBaseNames = Object.keys(statusIconMap);
    for (var i = 0; i < statusIconDimensions.length; i++) {
        var iconDim = statusIconDimensions[i];
        for (var ii = 0; ii < statusIconBaseNames.length; ii++) {
            var statusIconBaseName = statusIconBaseNames[ii];
            statusIconMap[statusIconBaseName + '-' + iconDim] = statusIconMap[statusIconBaseName];
        }
    }

    var STATIC_ORB_STYLE_TEMPLATE = "background: @background@;" +
        " background-image: -moz-radial-gradient(3px 3px 45deg, circle cover, @stop1@ 0%, @stop2@ 100%);" +
        " background-image: -webkit-radial-gradient(3px 3px, circle cover, @stop1@, @stop2@);" +
        " background-image: radial-gradient(circle at 3px 3px, @stop1@ 0%, @stop2@ 100%);";

})();
