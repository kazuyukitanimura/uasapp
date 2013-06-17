$(function() {
  setTimeout(function() {
    window.scrollTo(0, 1); // hide the scroll bar for iPhone
  },
  200);
  var updateInterval = 5000;
  var API_BASE_URL = '/api/v1/';
  var funcInterval = function(func, duration) {
    setInterval(func.bind(this), duration);
  };
  var update = function(directionUp) {
    var getUrl = API_BASE_URL + 'timeline';
    var $timelineContainer = $('#timeline');
    var $children = $timelineContainer.children();
    var newestId = $children.first().attr('id');
    var oldestId = $children.last().attr('id');
    var params = {};
    if (directionUp && newestId) {
      params.gt_id = newestId;
    }
    if (!directionUp && oldestId) {
      params.lt_id = oldestId;
    }
    var param = $.param(params);
    getUrl += params ? '?' + param: '';
    $.get(getUrl).done(function(entries) {
      if (directionUp) {
        entries = entries.reverse();
      }
      for (var i = 0, l = entries.length; i < l; i++) {
        var entry = entries[i];
        var data = entry.data;
        var bubbles = data.bubbles;
        var $entry = $('<li></li>', {
          'id': entry.id,
          'class': 'span12 clearfix'
        });
        if (directionUp) {
          $entry.prependTo($timelineContainer);
        } else {
          $entry.appendTo($timelineContainer);
        }
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
          setTimeout($bubble.hide.bind($bubble, 0, funcInterval.bind($bubble, $bubble.hide, data.duration)), bubble.elapsed + bubble.rmsec);
          setTimeout($bubble.show.bind($bubble, 0, funcInterval.bind($bubble, $bubble.show, data.duration)), bubble.elapsed);
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
  setInterval(update.bind(true), updateInterval);
});

