/* jslint node: true */
/* global describe, it, expect */

"use strict";

var testUtil = require("./test-util");

describe("index.js", function () {

    it("- test", function (done) {
        testUtil.onPage(function(window) {
            var jqueryDetached = require("../js/index");            
            var $1 = jqueryDetached.getJQuery();
            
            expect(window.$).not.toBeDefined();
            expect(window.jQuery).not.toBeDefined();
            
            expect($1('#divOnPage').text()).toBe('jQuery Detached');
            
            var $2 = jqueryDetached.getJQuery();
            expect($1 === $2).toBe(true);

            var $3 = jqueryDetached.newJQuery();
            expect($1 !== $3).toBe(true);

            expect($1('#divOnPage').text()).toBe('jQuery Detached');
            expect($3('#divOnPage').text()).toBe('jQuery Detached');
            
            $1.fn.greenify = function() {
                this.css( "color", "green" );
            };

            $1("#divOnPage").greenify();

            try {
                $3("#divOnPage").greenify();
                expect('$3').toBe('throwing an exception');
            } catch (e) {
                // This is expected
            }
            
            done();
        });
    });
});
