$(function() {
  setTimeout(function() {
    window.scrollTo(0, 1); // hide the scroll bar for iPhone
  },
  200);
  var updateInterval = 5000;
  var API_BASE_URL = '/api/v1/';
  var newestId = null;
  var oldestId = null;
  var update = function() {
    var getUrl = API_BASE_URL + 'timeline';
    var params = {};
    var gt_id = newestId;
    var lt_id = oldestId;
    if (gt_id) {
      params.gt_id = gt_id;
    }
    if (lt_id) {
      params.lt_id = lt_id;
    }
    $.get([getUrl, $.param(params)].join('?')).done(function(entries) {
      var $timelineContainer = $('#timeline');
      for (var i = 0, l = entries.length; i < l; i++) {
        var entry = entries[i];
        var data = entry.data;
        var bubbles = data.bubbles;
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
        for (var j = 0, m = bubbles.length; j < m; j++) {
          var bubble = bubbles[j];
          var $bubble = $('<div></div>', {
            'class': 'bubble animated bounce',
            'style': ['top:', bubble.y, '%; left:', bubble.x, '%; display: none;'].join('')
          }).text(bubble.text).appendTo($imgWrapper);
          setTimeout($bubble.hide.bind($bubble, 0, function(duration) {
            setInterval(this.hide.bind(this), duration);
          }.bind($bubble, data.duration)), bubble.elapsed + bubble.rmsec);
          setTimeout($bubble.show.bind($bubble, 0, function(duration) {
            setInterval(this.show.bind(this), duration);
          }.bind($bubble, data.duration)), bubble.elapsed);
        }
        var $ctrlWrapper = $('<div></div>', {
          'class': 'ctrl-wrapper pull-left caption'
        }).appendTo($entryInner);
        var $imgTitle = $('<h3></h3>', {
          'class': 'img-title'
        }).appendTo($ctrlWrapper);
        var $title = $('<span></span>', {
          'class': 'title'
        }).text(data.title).appendTo($imgTitle);
        var $btnBar = $('<div></div>', {
          'class': 'btn-toolbar'
        }).appendTo($ctrlWrapper);
        var $btnGroup = $('<div></div>', {
          'class': 'btn-group'
        }).appendTo($btnBar);
        var $editBtn = $('<button></button>', {
          'class': 'btn btn-primary'
        }).html('<i class="icon-comments icon-white icon-large"></i>').appendTo($btnGroup);
        var $renewBtn = $('<button></button>', {
          'class': 'btn btn-info'
        }).html('<i class="icon-code-fork icon-white icon-large"></i>').appendTo($btnGroup);
        var $delBtn = $('<button></button>', {
          'class': 'btn btn-danger'
        }).html('<i class="icon-trash icon-white icon-large"></i>').appendTo($btnGroup);
        var $starBtn = $('<button></button>', {
          'class': 'btn btn-warning'
        }).html('<i class="icon-star icon-white icon-large"></i>').appendTo($btnGroup);
      }
      console.log(entries);
    }).fail(function() {
      $('#error-message').show();
    });
  };
  setInterval(update, updateInterval);
});

