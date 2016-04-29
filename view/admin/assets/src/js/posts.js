$(".del").on("click",function(e){
  e.preventDefault();
  var id = $(this).attr("rel");
  if (confirm("Are you sure you want to delete this post?")) {
    $.ajax({
      "url":"/admin/editor/"+id+"/",
      "type":"delete",
      "success":function(json){
        if(json.status === "success"){
          Materialize.toast("Post deleted", 500, "", function(){
            window.location.reload();
          });
        }else{
          Materialize.toast(json.msg, 4000)
        }
      }
    });
  }
});

