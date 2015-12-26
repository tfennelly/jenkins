//
// See https://github.com/tfennelly/jenkins-js-builder
//
var builder = require('jenkins-js-builder');

// Bundle apps ...
// See https://github.com/jenkinsci/js-builder#bundling

//
// Bundle the Install Wizard.
//
builder.bundle('src/main/js/pluginSetupWizard.js')
    .withExternalModuleMapping('jquery-detached', 'core-assets/jquery-detached:jquery2')
    .withExternalModuleMapping('bootstrap', 'core-assets/bootstrap:bootstrap3', {addDefaultCSS: true})
    .withExternalModuleMapping('handlebars', 'core-assets/handlebars:handlebars3')
    .less('src/main/less/pluginSetupWizard.less')
    .inDir('src/main/webapp/jsbundles');


//
// Bundle the Build History Listener.
//
builder.bundle('src/main/js/buildHistoryListener.js')
    .withExternalModuleMapping('jenkins-js-eventbus', 'core-assets/jenkins:event-bus')
    .inDir('src/main/webapp/jsbundles');
