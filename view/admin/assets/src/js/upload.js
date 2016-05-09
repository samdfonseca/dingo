function initUpload(p) {
    $('#attach-show').on("click", function () {
        $('#attach-upload').trigger("click");
    });
    $('#attach-upload').on("change", function () {
        alertify.confirm("Upload now?", function() {
            var bar = $('<p class="file-progress inline-block">0%</p>');
            $('#attach-form').ajaxSubmit({
                "beforeSubmit": function () {
                    $(p).before(bar);
                },
                "uploadProgress": function (event, position, total, percentComplete) {
                    var percentVal = percentComplete + '%';
                    bar.css("width", percentVal).html(percentVal);
                },
                "success": function (json) {
                    if (json.status === "error") {
                        bar.html(json.msg).addClass("err");
                        setTimeout(function () {
                            bar.remove();
                        }, 5000);
                    } else {
                        alertify.success("File has been uploaded.")
                        bar.html("/" + json.file.url + "&nbsp;&nbsp;&nbsp;(@" + json.file.name + ")");
                    }
                    $('#attach-upload').val("");
                    var cm = $('.CodeMirror')[0].CodeMirror;
                    var doc = cm.getDoc();
                    doc.replaceSelections(["![](/" + json.file.url + ")"]);
                }
            });
        }, function() {
            $(this).val("");
        });
    });
}
