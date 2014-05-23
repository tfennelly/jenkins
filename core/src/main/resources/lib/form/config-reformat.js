jQuery(document).ready(function($){
  var configForm = $("form[name='config']");
  var table = $('> table', configForm);
  var sectionHeaders = $('.section-header', table);
  var sectionHeaderRows = [];

  // Pull out the form buttons and add them outside/after the config table
  var formButtons = $('#bottom-sticker', table);
  formButtons.insertAfter(table);
  formButtons.removeAttr('style');
  formButtons.removeAttr('id'); // remove so as to stop hudson-behavior.js from messing with the style

  // Filter the sections, only including top level sections.
  sectionHeaders.each(function(index) {
    var thisHeader = $(this);
    // There's probably a more reliable way of doing this...
    if (thisHeader.closest('.setting-main').size() === 0) {
      sectionHeaderRows.push(thisHeader.closest('tr'));
    }
  });

  var numSections = sectionHeaderRows.length;
  var sectionAccordion = $('<div class="panel-group" id="config-accordion">').css('margin-top', '20px');
  var nextSectionIndex = 1;

  function addAccordionEntry(title, body) {
    var sectionId = "collapse" + nextSectionIndex;
    var entry = $(
      '<div class="panel panel-default">' +
      ' <div class="panel-heading">' +
      '   <h4 class="panel-title"><a data-toggle="collapse" data-parent="#config-accordion" href="#' + sectionId + '"></a></h4>' +
      ' </div>' +
      ' <div id="' + sectionId + '" class="panel-collapse collapse">' +
      '   <div class="panel-body"></div>' +
      ' </div>' +
      '</div>');

    $('a', entry).append(title);
    $('.panel-body', entry).append(body);
    sectionAccordion.append(entry);

    nextSectionIndex++;
  }

  // Pull out all the sections, merging them together and adding them to the accordion.
  $.each(sectionHeaderRows, function(index, thisHeaderRow) {
    var thisHeaderCell = $('td', thisHeaderRow);
    var thisHeaderDiv = $('div.section-header', thisHeaderCell);
    var rowsBetween;

    if (index < (numSections - 1)) {
      // There's a next section
      rowsBetween = thisHeaderRow.nextUntil(sectionHeaderRows[index + 1]);
    } else {
      rowsBetween = thisHeaderRow.nextUntil();
    }

    var configSection = $('<div class="config-section">');
    var configSectionTable = $('<table>').css('width', '100%');

    configSection.append(configSectionTable);
    configSectionTable.append();
    thisHeaderDiv.removeClass('section-header');

    // Move the section config rows into the new inner table...
    configSectionTable.append(rowsBetween);

    addAccordionEntry(thisHeaderDiv, configSection);
  });

  // Add the accordion after the form buttons and then enable it
  sectionAccordion.insertAfter(table);
  sectionAccordion.collapse();
});