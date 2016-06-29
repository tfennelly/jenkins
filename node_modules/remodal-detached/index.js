var $remodal;

exports.getBootstrap = function() {
    if (!$remodal) {
        var jquery = require('jquery-detached-2.1.4');
        var decorator = require('./decorator');
        
        $remodal = jquery.newJQuery();        
        decorator.addToJQuery($remodal);
    }
    return $remodal;
};

exports.clear = function() {
    $remodal = undefined;
};