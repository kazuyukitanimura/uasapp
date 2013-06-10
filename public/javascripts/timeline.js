$(function() {
  var API_BASE_URL = '/api/v1/';
  $.get(API_BASE_URL + 'timeline').done(function(entries) {
    var $timelineContainer = $('#timeline');
    for (var i = 0, l = entries.length; i < l; i++) {
      var entry = entries[i];
      var $entry = $('<div></div>', {'id': entry.id}).appendTo($timelineContainer);
      var $imgTitle = $('<h2></h2>', {'class': 'img-title'}).appendTo($entry);
      var $title = $('<span></span>', {'class': 'title'}).text(entry.data.title).appendTo($imgTitle);
    }
    console.log(entries);
  }).fail(function() {
    $('#error-message').show();
  });
});

