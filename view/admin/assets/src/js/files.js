$(function () {
  $(".del").on("click",function(e){
    e.preventDefault();
    var name = $(this).attr("name");
    var path = $(this).attr("rel");
    alertify.confirm("Are you sure you want to delete this file?", function() {
      $.ajax({
        "type": "delete",
        "url": "/admin/files/?path=" + path,
        "success": function (json) {
          if(json.status === "success"){
            console.log("#file-" + name);
            $("#file-" + name).remove();
            alertify.success("File deleted");
          }else{
            alert(json.msg);
          }
        }
      });
    });
  });

  initUpload("#attach-show");
});
