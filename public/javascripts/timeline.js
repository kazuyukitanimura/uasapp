$(function() {
  setTimeout(function() {
    window.scrollTo(0, 1); // hide the scroll bar for iPhone
  },
  200);
  var API_BASE_URL = '/api/v1/';
  $.get(API_BASE_URL + 'timeline').done(function(entries) {
    var $timelineContainer = $('#timeline');
    for (var i = 0, l = entries.length; i < l; i++) {
      var entry = entries[i];
      var data = entry.data;
      var $entry = $('<li></li>', {
        'id': entry.id,
        'class': 'span12 clearfix'
      }).appendTo($timelineContainer);
      var $entryInner = $('<div></div>', {
        'class': 'thumbnail clearfix'
      }).appendTo($entry);
      var $imgWrapper = $('<div></div>', {
        'class': 'img-wrapper pull-left span6 clearfix'
      }).appendTo($entryInner);
      var $img = $('<img>', {
        'class': 'img-tl'
      }).attr('src', data.url).data('duration', data.duration).appendTo($imgWrapper);
      var $ctrlWrapper = $('<div></div>', {
        'class': 'ctrl-wrapper pull-left caption'
      }).appendTo($entryInner);
      var $imgTitle = $('<h3></h3>', {
        'class': 'img-title'
      }).appendTo($ctrlWrapper);
      var $title = $('<span></span>', {
        'class': 'title'
      }).text(data.title).appendTo($imgTitle);
      var $editBtn = $('<button></button>', {
        'class': 'btn btn-primary'
      }).text('Add Bubbles').appendTo($ctrlWrapper);
      var $renewBtn = $('<button></button>', {
        'class': 'btn btn-info'
      }).text('Renew').appendTo($ctrlWrapper);
      var $delBtn = $('<button></button>', {
        'class': 'btn btn-danger'
      }).text('Delete').appendTo($ctrlWrapper);
    }
    console.log(entries);
  }).fail(function() {
    $('#error-message').show();
  });
});

