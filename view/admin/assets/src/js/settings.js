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
            var item = $(this).parent().parent()
            alertify.confirm("Delete this item?", function() {
                item.remove();
            });
        });
    });
    $("#add-nav").on("click", function(e) {
        e.preventDefault();
        $("#navigators").append($($(this).attr("rel")).html());
        componentHandler.upgradeDom();
        $(".del-nav").on("click", function(e) {
            e.preventDefault();
            var item = $(this).parent().parent()
            alertify.confirm("Delete this item?", function() {
                item.remove();
            });
        });
    });
    $(".del-nav").on("click", function(e) {
        e.preventDefault();
        var item = $(this).parent().parent()
        alertify.confirm("Delete this item?", function() {
            item.remove();
        });
    });
    $(".del-custom").on("click", function(e) {
        e.preventDefault();
        var item = $(this).parent().parent()
        alertify.confirm("Delete this item?", function() {
            item.remove();
        });
    });
})
