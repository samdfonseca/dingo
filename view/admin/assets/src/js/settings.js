$(function () {
    $('.setting-form').ajaxForm({
        'success': function() {
            alertify.success("Saved");
        },
        'error': function() {
            alertify.error(("Error: " + JSON.parse(json.responseText).msg));
        }
    });
    $("#add-custom").on("click", function(e) {
        e.preventDefault();
        $("#custom-settings").append($($(this).attr("rel")).html());
        componentHandler.upgradeDom();
        $(".del-custom").on("click", function(e) {
            e.preventDefault();
            if(confirm("Delete this item？")){
                $(this).parent().parent().remove();
            }
        });
    });
    $("#add-nav").on("click", function(e) {
        e.preventDefault();
        $("#navigators").append($($(this).attr("rel")).html());
        componentHandler.upgradeDom();
        $(".del-nav").on("click", function(e) {
            e.preventDefault();
            if(confirm("Delete this item？")){
                $(this).parent().parent().remove();
            }
        });
    });
    $(".del-nav").on("click", function(e) {
        e.preventDefault();
        if(confirm("Delete this item？")){
            $(this).parent().parent().remove();
        }
    });
    $(".del-custom").on("click", function(e) {
        e.preventDefault();
        if(confirm("Delete this item？")){
            $(this).parent().parent().remove();
        }
    });
})
