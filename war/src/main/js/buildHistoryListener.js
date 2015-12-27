var eventBus = require('jenkins-js-eventbus');
var $ = require('jquery-detached').getJQuery();
var buildHistoryListenerScript = $('#buildHistoryListenerScript');
var baseUrl = buildHistoryListenerScript.attr('data-base-url');
var jobName = buildHistoryListenerScript.attr('data-job');
var nextBuildNumber = parseInt(buildHistoryListenerScript.attr('data-next-build-num'));

// Just fire the global functions for now.
// Yeah, this is not good ... we need to eliminate these nasty global functions,
// but need to sort things out in hudson-behavior.js in order to do that !!!!
updateBuildHistory(baseUrl + "/buildHistory/ajax", nextBuildNumber);

var eventHandleTimeout = undefined;

// Register a handler to listen for 'job' related events. See filter below.
// These events are pushed from the server i.e. no polling.
eventBus.onPubSubEvent('job', 
    function(event) {
        if (eventHandleTimeout) {
            clearTimeout(eventHandleTimeout);
        }
        // Hmmm ... for some reason, need to wait for a sec after receiving this
        // event before firing the refresh ... it's like subsequent build history Ajax calls
        // are not seeing any new data unless we wait for a second?
        eventHandleTimeout = setTimeout(function() {
            eventHandleTimeout = undefined;
            // Again, call the ugly global ....
            fireRunStateChanged();
        }, 1000);
        
        console.log(event);
    }, {                        // Event filter:
        type: 'runStateChange', // - Only 'job:runStateChange' events
        jobName: jobName        // - Only events for this job
    });