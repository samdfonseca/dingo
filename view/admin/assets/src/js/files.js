$(function () {
  $("#files_table").on("click", '.delete-file', function(e){
    e.preventDefault();
    
    var me = $(this);
    var name = me.attr("name");
    var path = me.attr("rel");
    
    alertify.confirm("Are you sure you want to delete this file?", function() {
      $.ajax({
        "type": "delete",
        "url": "/admin/files/?path=" + path,
        "success": function (json) {
          if(json.status === "success"){
            me.parent().parent().remove();
            alertify.success("File deleted");
          }else{
            alert(json.msg);
          }
        }
      });
    });
  });
});
