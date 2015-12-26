var eventBus = require('jenkins-js-eventbus');

eventBus.onPubSubEvent('job', 
    function(event) {
        console.log(event);
    }, {
        type: 'runStateChange'
    });