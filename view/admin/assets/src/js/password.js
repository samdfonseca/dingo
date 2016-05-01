$(function(){
  new FormValidator("password-form",[
      {"name":"old","rules":"min_length[2]|max_length[20]"},
      {"name":"new","rules":"min_length[2]|max_length[20]"},
      {"name":"confirm","rules":"required|matches[new]"}
  ],function(errors,e){
    e.preventDefault();
    $('.invalid').hide();
    if(errors.length){
      $("#"+errors[0].id+"-invalid").removeClass("hide").show();
      return;
    }
    $('#password').ajaxSubmit({
      "success": function() {
        alertify.success("Password changed");
      },
      "error": function() {
        alertify.error(("Error: " + JSON.parse(json.responseText).msg));
      }
    });
  })
});
