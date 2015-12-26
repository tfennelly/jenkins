var eventBus = require('jenkins-js-eventbus');
var $ = require('jquery-detached').getJQuery();
var buildHistoryListenerScript = $('#buildHistoryListenerScript');
var baseUrl = buildHistoryListenerScript.attr('data-base-url');
var nextBuildNumber = parseInt(buildHistoryListenerScript.attr('data-next-build-num'));

// Just fire the global functions for now.
// Yeah, this is not good ... we need to eliminate these nasty global functions,
// but need to sort things out in hudson-behavior.js in order to do that !!!!
updateBuildHistory(baseUrl + "/buildHistory/ajax", nextBuildNumber);

eventBus.onPubSubEvent('job', 
    function() {
        // Hmmm ... for some reason, need to wait for a sec after receiving this
        // event before firing the refresh ... subsequent build history Ajax calls
        // not seeing any new data unless we wait for a second?
        setTimeout(function() {
            // Again, call the ugly global ....
            fireRunStateChanged();
        }, 1000);        
    }, {
        type: 'runStateChange'
    });