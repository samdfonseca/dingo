$(document).ready(function () {
    initComment();
    $("time.timeago").timeago();
});

function initComment() {
    var $list = $('#comment-list');
    if (!$list.length) {
        return;
    }
    if (localStorage.getItem("comment-author")) {
        $('#author').val(localStorage.getItem("comment-author"));
        $('#email').val(localStorage.getItem("comment-email"));
        $('#website').val(localStorage.getItem("comment-website"));
        $('#avatar').attr("src", localStorage.getItem("comment-avatar"));
        $('.c-avatar').removeClass("null");
    }
    $('#comment-content').on("focus", function () {
        if ($('.c-avatar').hasClass("null")) {
            $('.c-avatar-field').remove();
            $('.c-info-fields').removeClass("hide");
        }
    });
    $('#comment-show').on("click", function () {
        $('#comment-show').hide();
        var form = $('#comment-form');
        form.removeClass("hide").appendTo($list);
    });
    $('#comment-cancel').on("click", function () {
        $('#comment-form').addClass("hide");
        $('#comment-show').show();
    });
    $('#comment-form').ajaxForm(function (json) {
        if (json.res) {
            localStorage.setItem("comment-author", $('#author').val());
            localStorage.setItem("comment-email", $('#email').val());
            localStorage.setItem("comment-website", $('#website').val());
            localStorage.setItem("comment-avatar", json.comment.avatar);
            var tpl = $($('#comment-tpl').html());
            tpl.find(".comment-avatar").attr("src", json.comment.avatar).attr("alt", json.comment.avatar);
            tpl.find(".comment-name").attr("href", json.comment.website).text(json.comment.author);
            tpl.find(".comment-reply").attr("rel", json.comment.id);
            tpl.find(".comment-content").html("<p>" + json.comment.content + "</p>");
            var date = new Date(json.comment.create_time);
            tpl.find(".comment-message").html("Your comment is awaiting moderation.");
            tpl.attr("id", "comment-" + json.comment.id);
            if (json.comment.status == "approved") {
                tpl.find(".comment-check").remove();
            }
            var parentId = $('#comment-parent').val();
            tpl.insertAfter($('#comment-' + parentId));
            $('#comment-cancel').trigger("click");
            $('#comment-content').val("");
        } else {
            alert("Can not submit comment!");
        }
    });
    $list.on("click", ".comment-reply", function () {
        var id = $(this).attr("rel");
        var parentComment = $('#comment-' + id);
        var form = $('#comment-form');
        form.removeClass("hide").insertAfter($(this));
        $('#comment-show').hide();
        $('#comment-parent').val(id);
        $('#comment-form').removeClass("hide");
        $('.cancel-reply').show();
        var top = parentComment.offset().top;
        $('body,html').animate({scrollTop: top}, 500);
        return false;
    });
    $('.cancel-reply').on("click", function () {
        $('#comment-reply').empty();
        $('#comment-parent').val(0);
        $(this).hide();
        return false;
    });
}

$(document).ready(function () {
    $('#mobile-nav-trigger').click(function (el) {
        el.preventDefault();

        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            $(this).html('Show Navigation');
            $('#nav ul.nav').slideUp('fast').removeClass('active');
        } else {
            $(this).addClass('active');
            $(this).html('Close Navigation');
            $('#nav ul.nav').slideDown('fast').addClass('active');
        }
    });
});


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhvbWUuanMiLCJuYXZiYXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiaG9tZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICBpbml0Q29tbWVudCgpO1xuICAgICQoXCJ0aW1lLnRpbWVhZ29cIikudGltZWFnbygpO1xufSk7XG5cbmZ1bmN0aW9uIGluaXRDb21tZW50KCkge1xuICAgIHZhciAkbGlzdCA9ICQoJyNjb21tZW50LWxpc3QnKTtcbiAgICBpZiAoISRsaXN0Lmxlbmd0aCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImNvbW1lbnQtYXV0aG9yXCIpKSB7XG4gICAgICAgICQoJyNhdXRob3InKS52YWwobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJjb21tZW50LWF1dGhvclwiKSk7XG4gICAgICAgICQoJyNlbWFpbCcpLnZhbChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImNvbW1lbnQtZW1haWxcIikpO1xuICAgICAgICAkKCcjd2Vic2l0ZScpLnZhbChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImNvbW1lbnQtd2Vic2l0ZVwiKSk7XG4gICAgICAgICQoJyNhdmF0YXInKS5hdHRyKFwic3JjXCIsIGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiY29tbWVudC1hdmF0YXJcIikpO1xuICAgICAgICAkKCcuYy1hdmF0YXInKS5yZW1vdmVDbGFzcyhcIm51bGxcIik7XG4gICAgfVxuICAgICQoJyNjb21tZW50LWNvbnRlbnQnKS5vbihcImZvY3VzXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCQoJy5jLWF2YXRhcicpLmhhc0NsYXNzKFwibnVsbFwiKSkge1xuICAgICAgICAgICAgJCgnLmMtYXZhdGFyLWZpZWxkJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAkKCcuYy1pbmZvLWZpZWxkcycpLnJlbW92ZUNsYXNzKFwiaGlkZVwiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgICQoJyNjb21tZW50LXNob3cnKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCgnI2NvbW1lbnQtc2hvdycpLmhpZGUoKTtcbiAgICAgICAgdmFyIGZvcm0gPSAkKCcjY29tbWVudC1mb3JtJyk7XG4gICAgICAgIGZvcm0ucmVtb3ZlQ2xhc3MoXCJoaWRlXCIpLmFwcGVuZFRvKCRsaXN0KTtcbiAgICB9KTtcbiAgICAkKCcjY29tbWVudC1jYW5jZWwnKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCgnI2NvbW1lbnQtZm9ybScpLmFkZENsYXNzKFwiaGlkZVwiKTtcbiAgICAgICAgJCgnI2NvbW1lbnQtc2hvdycpLnNob3coKTtcbiAgICB9KTtcbiAgICAkKCcjY29tbWVudC1mb3JtJykuYWpheEZvcm0oZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgaWYgKGpzb24ucmVzKSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImNvbW1lbnQtYXV0aG9yXCIsICQoJyNhdXRob3InKS52YWwoKSk7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImNvbW1lbnQtZW1haWxcIiwgJCgnI2VtYWlsJykudmFsKCkpO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJjb21tZW50LXdlYnNpdGVcIiwgJCgnI3dlYnNpdGUnKS52YWwoKSk7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImNvbW1lbnQtYXZhdGFyXCIsIGpzb24uY29tbWVudC5hdmF0YXIpO1xuICAgICAgICAgICAgdmFyIHRwbCA9ICQoJCgnI2NvbW1lbnQtdHBsJykuaHRtbCgpKTtcbiAgICAgICAgICAgIHRwbC5maW5kKFwiLmNvbW1lbnQtYXZhdGFyXCIpLmF0dHIoXCJzcmNcIiwganNvbi5jb21tZW50LmF2YXRhcikuYXR0cihcImFsdFwiLCBqc29uLmNvbW1lbnQuYXZhdGFyKTtcbiAgICAgICAgICAgIHRwbC5maW5kKFwiLmNvbW1lbnQtbmFtZVwiKS5hdHRyKFwiaHJlZlwiLCBqc29uLmNvbW1lbnQud2Vic2l0ZSkudGV4dChqc29uLmNvbW1lbnQuYXV0aG9yKTtcbiAgICAgICAgICAgIHRwbC5maW5kKFwiLmNvbW1lbnQtcmVwbHlcIikuYXR0cihcInJlbFwiLCBqc29uLmNvbW1lbnQuaWQpO1xuICAgICAgICAgICAgdHBsLmZpbmQoXCIuY29tbWVudC1jb250ZW50XCIpLmh0bWwoXCI8cD5cIiArIGpzb24uY29tbWVudC5jb250ZW50ICsgXCI8L3A+XCIpO1xuICAgICAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShqc29uLmNvbW1lbnQuY3JlYXRlX3RpbWUpO1xuICAgICAgICAgICAgdHBsLmZpbmQoXCIuY29tbWVudC1tZXNzYWdlXCIpLmh0bWwoXCJZb3VyIGNvbW1lbnQgaXMgYXdhaXRpbmcgbW9kZXJhdGlvbi5cIik7XG4gICAgICAgICAgICB0cGwuYXR0cihcImlkXCIsIFwiY29tbWVudC1cIiArIGpzb24uY29tbWVudC5pZCk7XG4gICAgICAgICAgICBpZiAoanNvbi5jb21tZW50LnN0YXR1cyA9PSBcImFwcHJvdmVkXCIpIHtcbiAgICAgICAgICAgICAgICB0cGwuZmluZChcIi5jb21tZW50LWNoZWNrXCIpLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHBhcmVudElkID0gJCgnI2NvbW1lbnQtcGFyZW50JykudmFsKCk7XG4gICAgICAgICAgICB0cGwuaW5zZXJ0QWZ0ZXIoJCgnI2NvbW1lbnQtJyArIHBhcmVudElkKSk7XG4gICAgICAgICAgICAkKCcjY29tbWVudC1jYW5jZWwnKS50cmlnZ2VyKFwiY2xpY2tcIik7XG4gICAgICAgICAgICAkKCcjY29tbWVudC1jb250ZW50JykudmFsKFwiXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWxlcnQoXCJDYW4gbm90IHN1Ym1pdCBjb21tZW50IVwiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgICRsaXN0Lm9uKFwiY2xpY2tcIiwgXCIuY29tbWVudC1yZXBseVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpZCA9ICQodGhpcykuYXR0cihcInJlbFwiKTtcbiAgICAgICAgdmFyIHBhcmVudENvbW1lbnQgPSAkKCcjY29tbWVudC0nICsgaWQpO1xuICAgICAgICB2YXIgZm9ybSA9ICQoJyNjb21tZW50LWZvcm0nKTtcbiAgICAgICAgZm9ybS5yZW1vdmVDbGFzcyhcImhpZGVcIikuaW5zZXJ0QWZ0ZXIoJCh0aGlzKSk7XG4gICAgICAgICQoJyNjb21tZW50LXNob3cnKS5oaWRlKCk7XG4gICAgICAgICQoJyNjb21tZW50LXBhcmVudCcpLnZhbChpZCk7XG4gICAgICAgICQoJyNjb21tZW50LWZvcm0nKS5yZW1vdmVDbGFzcyhcImhpZGVcIik7XG4gICAgICAgICQoJy5jYW5jZWwtcmVwbHknKS5zaG93KCk7XG4gICAgICAgIHZhciB0b3AgPSBwYXJlbnRDb21tZW50Lm9mZnNldCgpLnRvcDtcbiAgICAgICAgJCgnYm9keSxodG1sJykuYW5pbWF0ZSh7c2Nyb2xsVG9wOiB0b3B9LCA1MDApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG4gICAgJCgnLmNhbmNlbC1yZXBseScpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAkKCcjY29tbWVudC1yZXBseScpLmVtcHR5KCk7XG4gICAgICAgICQoJyNjb21tZW50LXBhcmVudCcpLnZhbCgwKTtcbiAgICAgICAgJCh0aGlzKS5oaWRlKCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbn1cbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbW9iaWxlLW5hdi10cmlnZ2VyJykuY2xpY2soZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgIGVsLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2FjdGl2ZScpKSB7XG4gICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICQodGhpcykuaHRtbCgnU2hvdyBOYXZpZ2F0aW9uJyk7XG4gICAgICAgICAgICAkKCcjbmF2IHVsLm5hdicpLnNsaWRlVXAoJ2Zhc3QnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICQodGhpcykuaHRtbCgnQ2xvc2UgTmF2aWdhdGlvbicpO1xuICAgICAgICAgICAgJCgnI25hdiB1bC5uYXYnKS5zbGlkZURvd24oJ2Zhc3QnKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICB9KTtcbn0pO1xuXG4iXX0=
