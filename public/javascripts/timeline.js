$(function() {
  var apiBaseUrl = '/api/v1/';
  $.get(apiBaseUrl + 'timeline').done(function(data) {
    console.log(data);
  }).fail(function() {
    $('#error-message').show();
  });
});

