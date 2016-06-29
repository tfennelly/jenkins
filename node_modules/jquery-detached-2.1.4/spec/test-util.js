var jsdom = require("jsdom");

var PAGE = '<html><head></head><body><div id="divOnPage">jQuery Detached</div></body></html>';

exports.onPage = function(testFunc) {
    jsdom.env(PAGE, [],
        function (errors, window) {
            require("window-handle").setWindow(window);
            testFunc(window);
        }
    );    
}