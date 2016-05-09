$(function () {
    $('.comment-delete').on("click", function () {
        var comment = $(this);
        alertify.confirm("Are you sure you want to delete this post?", function() {
            var id = comment.attr("rel");
            $.ajax({
                type: "delete",
                url: "/admin/comments/?id=" + id,
                success: function (json) {
                    alertify.success("Comment delted");
                    $('#comment-' + id).remove();
                },
                error: function (json) {
                    alertify.error(("Error: " + JSON.parse(json.responseText).msg));
                }
            });
        });
    });
    $('.comment-approve').on("click", function () {
        var comment = $(this);
        var id = $(this).attr("rel");
        $.ajax({
            type: "put",
            url: "/admin/comments/?id=" + id,
            "success":function(json){
                if(json.status === "success"){
                    alertify.success("Comment approved");
                    comment.removeClass("comment-approve").removeClass("mdl-color-text--green").addClass("disabled").attr("disabled", true);
                    comment.unbind();
                }else{
                    alertify.error(("Error: " + JSON.parse(json.responseText).msg));
                }
            }
        });
        return false;
    });
    $('.comment-reply').on("click",function(){
        var id = $(this).attr("rel");
        $('#comment-'+id).after($('#comment-block').detach().show());
        $('#comment-parent').val(id);
        return false;
    });
    $('#comment-form').ajaxForm({
        success: function (json) {
            alertify.success("Succesfully replied");
            window.location.href = "/admin/comments/";
        },
        error: function (json) {
            alertify.error(("Error: " + JSON.parse(json.responseText).msg));
        }
    });
    $('#comment-close').on("click",function(){
        $('#comment-block').hide();
        $('#comment-parent').val(0);
        $('#comment-content').val("");
    });
});
