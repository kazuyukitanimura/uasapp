$(function() {
  var API_BASE_URL = '/api/v1/';
  $.get(API_BASE_URL + 'timeline').done(function(entries) {
    var $timelineContainer = $('#timeline');
    for (var i = 0, l = entries.length; i < l; i++) {
      var entry = entries[i];
      var data = entry.data;
      var $entry = $('<div></div>', {'id': entry.id}).appendTo($timelineContainer);
      var $imgTitle = $('<h2></h2>', {'class': 'img-title'}).appendTo($entry);
      var $title = $('<span></span>', {'class': 'title'}).text(data.title).appendTo($imgTitle);
      var $imgWrapper = $('<div></div>', {'class': 'img-wrapper'}).appendTo($entry);
      var $img = $('<img>').data('imgurl', data.url).data('duration', data.duration).appendTo($imgWrapper);
    }
    console.log(entries);
  }).fail(function() {
    $('#error-message').show();
  });
});

