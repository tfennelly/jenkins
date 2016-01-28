/*
 * Internal support module for config tables.
 */

var jQD = require('../../util/jquery-ext.js');

exports.markConfigForm = function(configTable) {
    var form = configTable.closest('form');
    form.addClass('jenkins-config');
    return form;
};

exports.findConfigTables = function() {
    var $ = jQD.getJQuery();
    // The config tables are the immediate child <table> elements of <form> elements
    // with a name of "config"?
    return $('form[name="config"] > table');
};

exports.decorateConfigTable = function(configTable) {
    var $ = jQD.getJQuery();
    var sectionHeaders = $('.section-header', configTable);
    var configForm = exports.markConfigForm(configTable);

    // Mark the ancestor <tr>s of the section headers and add a title
    sectionHeaders.each(function () {
        var sectionHeader = $(this);
        var sectionRow = sectionHeader.closest('tr');
        var sectionTitle = sectionRow.text();

        // Remove leading hash from accumulated text in title (from <a> element).
        if (sectionTitle.indexOf('#') === 0) {
            sectionTitle = sectionTitle.substring(1);
        }

        sectionRow.addClass('section-header-row');
        sectionRow.attr('title', sectionTitle);
    });

    // Go through the top level <tr> elements (immediately inside the <tbody>)
    // and group the related <tr>s based on the "section-header-row", using a "normalized"
    // version of the section title as the section id.
    var tbody = $('> tbody', configTable);
    var topRows = $('> tr', tbody);
    var configTableMetadata = new ConfigTableMetaData(configForm, configTable, topRows);
    var curSection = new ConfigSection(configTableMetadata, 'General');

    configTableMetadata.sections.push(curSection);
    curSection.id = exports.toId(curSection.title);

    topRows.each(function () {
        var tr = $(this);
        if (tr.hasClass('section-header-row')) {
            // a new section
            var title = tr.attr('title');
            curSection = new ConfigSection(configTableMetadata, title);
            configTableMetadata.sections.push(curSection);
        }

        curSection.rows.push(tr);
        tr.addClass(curSection.id);
    });

    var buttonsRow = $('#bottom-sticker', configTable).closest('tr');
    buttonsRow.removeClass(curSection.id);
    buttonsRow.addClass(exports.toId('buttons'));

    return configTableMetadata;
};

exports.toId = function(string) {
    string = string.trim();
    return 'config_' + string.replace(/[\W_]+/g, '_').toLowerCase();
};

/*
 * =======================================================================================
 * Configuration table section.
 * =======================================================================================
 */
function ConfigSection(parentCMD, title) {
    this.parentCMD = parentCMD;
    this.title = title;
    this.id = exports.toId(title);
    this.rows = [];
    this.rowSets = undefined;
    this.activator = undefined;
}

/*
 * Set the element (jquery) that activates the section (on click).
 */
ConfigSection.prototype.setActivator = function(activator) {
    this.activator = activator;

    var section = this;
    section.activator.click(function() {
        section.parentCMD.showSection(section);
    });
};

ConfigSection.prototype.activate = function() {
    if (this.activator) {
        this.activator.click();
    } else {
        console.warn('No activator attached to config section object.');
    }
};

ConfigSection.prototype.activeRowCount = function() {
    var activeRowCount = 0;
    for (var i = 0; i < this.rows.length; i++) {
        if (this.rows[i].hasClass('active')) {
            activeRowCount++;
        }
    }
    return activeRowCount;
};

ConfigSection.prototype.updateRowSetVisibility = function() {
    if (this.rowSets === undefined) {
        // Lazily gather rowset information.
        this.gatherRowSets();
    }
    for (var i = 0; i < this.rowSets.length; i++) {
        var rowSet = this.rowSets[i];
        if (rowSet.toggleWidget !== undefined) {
            var isChecked = rowSet.toggleWidget.is(':checked');
            for (var ii = 0; ii < rowSet.rows.length; ii++) {
                if (isChecked) {
                    rowSet.rows[ii].show();
                } else {
                    rowSet.rows[ii].hide();
                }
            }
        }
    }
};

ConfigSection.prototype.gatherRowSets = function() {
    this.rowSets = [];

    // Only tracking row-sets that are bounded by 'row-set-start' and 'row-set-end' (for now).
    // Also, only capturing the rows after the 'block-control' input (checkbox, radio etc)
    // and before the 'row-set-end'.
    // TODO: Find out how these actually work. It seems like they can be nested into a hierarchy :(
    // Also seems like you can have these "optional-block" thingies which are not wrapped
    // in 'row-set-start' etc. Grrrrrr :(

    var curRowSet = undefined; // jshint ignore:line
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];

        if (row.hasClass('row-set-start')) {
            curRowSet = new ConfigRowSet(row);
            curRowSet.findToggleWidget(row);
        } else if (curRowSet !== undefined) {
            if (row.hasClass('row-set-end')) {
                curRowSet.endRow = row;
                // Only capture the row-set if we find a 'row-set-end'.
                // Yeah, this does not handle hierarchical stuff (see above TO-DO).
                this.rowSets.push(curRowSet);
                curRowSet = undefined;
            } else if (curRowSet.toggleWidget === undefined) {
                curRowSet.findToggleWidget(row);
            } else {
                // we have the toggleWidget, which means that this row is
                // one of the rows after that row and is one of the rows that's
                // subject to being made visible/hidden when the input is
                // checked or unchecked.
                curRowSet.rows.push(row);
            }
        }
    }
};

ConfigSection.prototype.getRowSetLabels = function() {
    var labels = [];
    for (var i = 0; i < this.rowSets.length; i++) {
        var rowSet = this.rowSets[i];
        if (rowSet.label) {
            labels.push(rowSet.label);
        }
    }
    return labels;
};

ConfigSection.prototype.highlightText = function(text) {
    var $ = jQD.getJQuery();
    var selector = ":containsci('" + text + "')";

    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];

        /*jshint loopfunc: true */
        $('span.highlight-split', row).each(function() { // jshint ignore:line
            var highlightSplit = $(this);
            highlightSplit.before(highlightSplit.text());
            highlightSplit.remove();
        });

        if (text !== '') {
            var regex = new RegExp('(' + text + ')',"gi");

            /*jshint loopfunc: true */
            $(selector, row).find(':not(:input)').each(function() {
                var $this = $(this);
                $this.contents().each(function () {
                    // We specifically only mess with text nodes
                    if (this.nodeType === 3) {
                        var highlightedMarkup = this.wholeText.replace(regex, '<span class="highlight">$1</span>');
                        $(this).replaceWith('<span class="highlight-split">' + highlightedMarkup + '</span>');
                    }
                });
            });
        }
    }
};

/*
 * =======================================================================================
 * Configuration table section.
 * =======================================================================================
 */
function ConfigRowSet(startRow) {
    this.startRow = startRow;
    this.rows = [];
    this.endRow = undefined;
    this.toggleWidget = undefined;
    this.label = undefined;
}

/*
 * Find the row-set toggle widget i.e. the input element that indicates that
 * the row-set rows should be made visible or not.
 */
ConfigRowSet.prototype.findToggleWidget = function(row) {
    var $ = jQD.getJQuery();
    var input = $(':input.block-control', row);
    if (input.size() === 1) {
        this.toggleWidget = input;
        this.label = input.parent().find('label').text();
        input.addClass('disable-behavior');
    }
};

/*
 * =======================================================================================
 * ConfigTable MetaData class.
 * =======================================================================================
 */
function ConfigTableMetaData(configForm, configTable, topRows) {
    this.configForm = configForm;
    this.configTable = configTable;
    this.topRows = topRows;
    this.sections = [];
    this.findInput = undefined;
    this.showListeners = [];
    this.configWidgets = undefined;
    this.addWidgetsContainer();
    this.addFindWidget();
}

ConfigTableMetaData.prototype.addWidgetsContainer = function() {
    var $ = jQD.getJQuery();
    this.configWidgets = $('<div class="jenkins-config-widgets"></div>');
    this.configWidgets.insertBefore(this.configForm);
};

ConfigTableMetaData.prototype.addFindWidget = function() {
    var $ = jQD.getJQuery();
    var thisTMD = this;
    var findWidget = $('<div class="find-container"><div class="find"><span title="Clear" class="clear">x</span><input placeholder="find"/></div></div>');

    thisTMD.findInput = $('input', findWidget);

    // Add the find text clearer
    $('.clear', findWidget).click(function() {
        thisTMD.findInput.val('');
        thisTMD.showSections('');
        thisTMD.findInput.focus();
    });

    var findTimeout;
    thisTMD.findInput.keydown(function() {
        if (findTimeout) {
            clearTimeout(findTimeout);
            findTimeout = undefined;
        }
        findTimeout = setTimeout(function() {
            findTimeout = undefined;
            thisTMD.showSections(thisTMD.findInput.val());
        }, 300);
    });

    this.configWidgets.append(findWidget);
};

ConfigTableMetaData.prototype.sectionCount = function() {
    return this.sections.length;
};

ConfigTableMetaData.prototype.hasSections = function() {
    var hasSections = (this.sectionCount() > 0);
    if (!hasSections) {
        console.warn('Jenkins configuration without sections?');
    }
    return  hasSections;
};

ConfigTableMetaData.prototype.sectionIds = function() {
    var sectionIds = [];
    for (var i = 0; i < this.sections.length; i++) {
        sectionIds.push(this.sections[i].id);
    }
    return sectionIds;
};

ConfigTableMetaData.prototype.activateSection = function(sectionId) {
    if (!sectionId) {
        throw 'Invalid section id "' + sectionId + '"';
    }

    var section = this.getSection(sectionId);
    if (section) {
        section.activate();
    }
};

ConfigTableMetaData.prototype.activeSection = function() {
    if (this.hasSections()) {
        for (var i = 0; i < this.sections.length; i++) {
            var section = this.sections[i];
            if (section.activator.hasClass('active')) {
                return section;
            }
        }
    }
};

ConfigTableMetaData.prototype.getSection = function(sectionId) {
    if (this.hasSections()) {
        for (var i = 0; i < this.sections.length; i++) {
            var section = this.sections[i];
            if (section.id === sectionId) {
                return section;
            }
        }
    }
    return undefined;
};

ConfigTableMetaData.prototype.activateFirstSection = function() {
    if (this.hasSections()) {
        this.activateSection(this.sections[0].id);
    }
};

ConfigTableMetaData.prototype.activeSectionCount = function() {
    var activeSectionCount = 0;
    if (this.hasSections()) {
        for (var i = 0; i < this.sections.length; i++) {
            var section = this.sections[i];
            if (section.activator.hasClass('active')) {
                activeSectionCount++;
            }
        }
    }
    return activeSectionCount;
};

ConfigTableMetaData.prototype.showSection = function(section) {
    if (typeof section === 'string') {
        section = this.getSection(section);
    }

    if (section) {
        var $ = jQD.getJQuery();

        // Deactivate currently active section ...
        this.deactivateActiveSection();

        // Active the specified section
        section.activator.addClass('active');
        this.topRows.filter('.' + section.id).addClass('active').show();

        // Hide the section header row. No need for it now because the
        // tab text acts as the section label.
        $('.section-header-row').hide();

        // and always show the buttons
        this.topRows.filter('.config_buttons').show();

        // Update the row-set visibility
        section.updateRowSetVisibility();
        section.highlightText(this.findInput.val());

        fireListeners(this.showListeners, section);
    }
};

ConfigTableMetaData.prototype.deactivateActiveSection = function() {
    var $ = jQD.getJQuery();

    $('.config-section-activator.active', this.activatorContainer).removeClass('active');
    this.topRows.filter('.active').removeClass('active');
    this.topRows.hide();
};

ConfigTableMetaData.prototype.onShowSection = function(listener) {
    this.showListeners.push(listener);
};

ConfigTableMetaData.prototype.showSections = function(withText) {
    if (withText === '') {
        if (this.hasSections()) {
            for (var i1 = 0; i1 < this.sections.length; i1++) {
                this.sections[i1].activator.show();
            }
            var activeSection = this.activeSection();
            if (!activeSection) {
                this.showSection(this.sections[0]);
            } else {
                activeSection.highlightText(this.findInput.val());
            }
        }
    } else {
        if (this.hasSections()) {
            var $ = jQD.getJQuery();
            var selector = ":containsci('" + withText + "')";
            var sectionsWithText = [];

            for (var i2 = 0; i2 < this.sections.length; i2++) {
                var section = this.sections[i2];
                var containsText = false;

                for (var i3 = 0; i3 < section.rows.length; i3++) {
                    var row = section.rows[i3];
                    var elementsWithText = $(selector, row);

                    if (elementsWithText.size() > 0) {
                        containsText = true;
                        break;
                    }
                }

                if (containsText) {
                    sectionsWithText.push(section);
                } else {
                    section.activator.hide();
                }
            }

            // Select the first section to contain the text.
            if (sectionsWithText.length > 0) {
                this.showSection(sectionsWithText[0]);
            } else {
                this.deactivateActiveSection();
            }
        }
    }
};

function fireListeners(listeners, contextObject) {
    for (var i = 0; i < listeners.length; i++) {
        fireListener(listeners[i], contextObject);
    }
    function fireListener(listener, contextObject) {
        setTimeout(function() {
            listener.call(contextObject);
        }, 1);
    }
}