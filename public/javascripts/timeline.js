$(function() {
  var API_BASE_URL = '/api/v1/';
  $.get(API_BASE_URL + 'timeline').done(function(entries) {
    var $timelineContainer = $('#timeline');
    for (var i = 0, l = entries.length; i < l; i++) {
      var entry = entries[i];
      var data = entry.data;
      var $entry = $('<div></div>', {'id': entry.id, 'class': 'row'}).appendTo($timelineContainer);
      var $imgWrapper = $('<div></div>', {'class': 'img-wrapper span6'}).appendTo($entry);
      var $img = $('<img>', {'class': 'img-tl'}).attr('src', data.url).data('duration', data.duration).appendTo($imgWrapper);
      var $ctrlWrapper = $('<div></div>', {'class': 'ctrl-wrapper span6'}).appendTo($entry);
      var $imgTitle = $('<h2></h2>', {'class': 'img-title'}).appendTo($ctrlWrapper);
      var $title = $('<span></span>', {'class': 'title'}).text(data.title).appendTo($imgTitle);
      var $editBtn = $('<button></button>', {'class': 'btn'}).text('Edit').appendTo($ctrlWrapper);
    }
    console.log(entries);
  }).fail(function() {
    $('#error-message').show();
  });
});

