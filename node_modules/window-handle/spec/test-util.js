var jsdom = require("jsdom");

var PAGE = '<html><head></head><body><div></div></body></html>';

exports.onPage = function(testFunc) {
    jsdom.env(PAGE, [],
        function (errors, window) {
            testFunc(window);
        }
    );    
}