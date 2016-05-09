$(function () {
  new FormValidator("signup-form", [
      {"name": "password", "rules": "required|min_length[4]|max_length[20]"}
  ], function (errors, e) {
    e.preventDefault();
    $('.invalid').hide();
    if (errors.length) {
      $("#" + errors[0].id + "-invalid").removeClass("hide").show();
      return;
    }
    $('#signup-form').ajaxSubmit({
      success: function (json) {
        window.location.href = "/admin/";
      },
      error: function (json) {
        alertify.error(("Error: " + JSON.parse(json.responseText).msg));
      }
    });
  })
});
