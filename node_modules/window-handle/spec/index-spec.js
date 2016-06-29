/* jslint node: true */
/* global describe, it, expect */

"use strict";

var testUtil = require("./test-util");

describe("index.js", function () {

    it("- test ok", function (done) {
        testUtil.onPage(function(window) {
            var windowHandle = require("../index");

            windowHandle.getWindow(function(theWindow) {
            	expect(theWindow).toBe(window);
            	done();
            }, 1000);

            windowHandle.setWindow(window);
        });
    });

    it("- test fail", function (done) {
        testUtil.onPage(function(window) {
            var windowHandle = require("../index");

            windowHandle.setWindow(undefined);
            windowHandle.getWindow(function(theWindow) {
            	expect(theWindow).not.toBeDefined();
            	expect(this.error).toBe('Timed out waiting on the window to be set.');
            	done();
            }, 1000);

            // don't set the window ... getWindow should timeout, the callback should be
            // but without a window instance, and ann error message set on the callback.
        });
    });
});
