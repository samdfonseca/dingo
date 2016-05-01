$(function () {
  new FormValidator("login-form", [
      {"name": "password", "rules": "required|min_length[4]|max_length[20]"}
  ], function (errors, e) {
    e.preventDefault();
    $('.invalid').hide();
    if (errors.length) {
      $("#" + errors[0].id + "-invalid").removeClass("hide").show();
      return;
    }

    $('#login-form').ajaxSubmit({
      dataType: "json",
      success: function (json) {
        if (json.status === "error") {
          alertify.error("Incorrect username & password combination.");
        } else {
          window.location.href = "/admin/";
        }
      }
    });
  })
});
