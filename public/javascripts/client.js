$(function() {
  var search_url = 'search';
  var self = this;
  var $q = $('input#q').focus();
  var maxPosition = 9;
  var topPosition = - 1;
  //var position = topPosition;
  var curHash = location.hash;
  var baseLinkId = 'link';
  var scrollDone = true;
  var offSet = 54;

  $q.keydown(function(e) {
    var keyCode = (e.keyCode || e.which);
    if (keyCode === 13) { // return key
      self.request();
      $q.blur();
      e.preventDefault();
    }
  });

  // TODO this code does not work
  //$q.focusin(function(e) {
  //  $q.select();
  //});
  self.request = function() {
    // clean up old results
    $('div.row-fluid').remove();
    location.hash = '';
    $('div.hero-unit').remove();
    // Insert spinning load sign
    $container = $('div#main.container');
    $spinner = $('<ul class="spinner"><li></li><li></li><li></li><li></li></ul>');
    $container.prepend($spinner);

    var q = encodeURIComponent($q.val().trim());
    // add the search query without reloading
    if (history.pushState) {
      history.pushState({
        "id": 100
      },
      document.title, location.protocol + "?q=" + q);
    }
    var params = {
      q: q
    };
    $.get(search_url, params, function(data) {
      // remove the spinner
      $spinner.remove();

      var links = JSON.parse(data);
      maxPosition = links.length - 1;
      for (var i = 0; i <= maxPosition; i++) {
        var link = links[i];
        var page = '<div id="' + baseLinkId + i + '" class="row-fluid"><a class="span12" target="_blank" href><h3>' + (i + 1) + '. ' + link.title + '</h3><div class="url">' + link.url + '</div><img src="' + link.url + '" /></a></div>';
        $container.append(page);
        // when to use a tag instead of iframe, a href should be encoded url and encoded search keywords
      }
      $('div.row-fluid').waypoint(function(e, direction) {
        curHash = $(this).attr('id');
        // waypoint bug, with offset it does not fire the event correctly
        //},
        //{
        //  offset: offset
      });
    });
  };

  var smoothScroll = function(direction, mouseScroll) {
    if (!scrollDone) {
      // too busy!
      return;
    } else {
      scrollDone = false;
    }
    var position = parseInt(curHash.replace(baseLinkId, ''), 10);
    if (isNaN(position)) {
      position = topPosition;
    }
    position = Math.max(topPosition, Math.min(maxPosition, position + direction));
    if (position < 0) {
      $('html,body').animate({
        scrollTop: 0
      },
      150, 'easeOutQuad', function() {
        location.hash = '';
        scrollDone = true;
      });
    } else {
      var $targetOffset = $('#' + baseLinkId + position).offset();
      if ($targetOffset) {
        var $prevTargetOffset = $('#' + baseLinkId + (position - direction)).offset();
        if ($prevTargetOffset && mouseScroll) {
          var $scrollTop = $('body').scrollTop();
          // magic number
          if (Math.abs($scrollTop - $prevTargetOffset.top) * 2 < Math.abs($targetOffset.top - $scrollTop)) {
            $targetOffset = $prevTargetOffset;
            position -= direction;
          }
        }
        $('html,body').animate({
          scrollTop: $targetOffset.top - offSet
        },
        350, 'easeOutQuad', function() {
          location.hash = baseLinkId + position;
          curHash = baseLinkId + position;
          scrollDone = true;
        });
      }
    }
  };

  $('body').keydown(function(e) {
    var keyCode = (e.keyCode || e.which);
    //if (keyCode === 37 || keyCode === 38 || (keyCode === 9 && keyCode === 32)) { // left arrow, up arrow, shift+space
    if (keyCode === 38) { // up arrow
      smoothScroll( - 1, false); // scroll up
      e.preventDefault();
      //} else if (keyCode === 39 || keyCode === 40 || keyCode === 32) { // right arrow, down arrow, space
    } else if (keyCode === 40) { // down arrow
      smoothScroll(1, false); // scroll down
      e.preventDefault();
    }
  });

  var eObj = null;
  $(window).on('DOMMouseScroll mousewheel', function(e) {
    clearTimeout(eObj);
    // http://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers/5542105#5542105
    e = e.originalEvent;
    var direction = (e.detail < 0 || e.wheelDelta > 0) ? - 1: 1;
    eObj = setTimeout(smoothScroll.bind(null, direction, true), 1000);
  });

  //var eObj = null;
  //$(window).on('DOMMouseScroll mousewheel', function(e) {
  //  clearTimeout(eObj);
  //  // http://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers/5542105#5542105
  //  e = e.originalEvent;
  //  var delta = 0;
  //  var w = e.wheelDelta;
  //  var d = e.detail;
  //  if (d) {
  //    if (w) {
  //      delta = w / d / 40 * d > 0 ? 1: - 1; // Opera
  //    } else {
  //      delta = - d / 3; // Firefox;         TODO: do not /3 for OS X
  //    }
  //  } else {
  //    delta = w / 120; // IE/Safari/Chrome TODO: /3 for Chrome OS X
  //  }
  //  if (delta > 0.02) {
  //    eObj = setTimeout(smoothScroll.bind(null, -1, true), 1000);
  //  } else if (delta < - 0.02) {
  //    eObj = setTimeout(smoothScroll.bind(null, 1, true), 1000);
  //  } else {
  //    clearTimeout(eObj);
  //  }
  //});
  // if there are search parameters, request it
  if (location.search) {
    $q.val(decodeURIComponent(location.search.match(/[?&]q=(.*)[&#]?/)[1]));
    self.request();
  }
});

