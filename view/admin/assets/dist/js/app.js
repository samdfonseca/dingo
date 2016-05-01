/**
 * Created by Kupletsky Sergey on 17.10.14.
 *
 * Material Sidebar (Profile menu)
 * Tested on Win8.1 with browsers: Chrome 37, Firefox 32, Opera 25, IE 11, Safari 5.1.7
 * You can use this sidebar in Bootstrap (v3) projects. HTML-markup like Navbar bootstrap component will make your work easier.
 * Dropdown menu and sidebar toggle button works with JQuery and Bootstrap.min.js
 */

// Sidebar toggle
//
// -------------------
$(document).ready(function() {
    var overlay = $('.sidebar-overlay');

    $('.sidebar-toggle').on('click', function() {
        var sidebar = $('#sidebar');
        sidebar.toggleClass('open');
        if ((sidebar.hasClass('sidebar-fixed-left') || sidebar.hasClass('sidebar-fixed-right')) && sidebar.hasClass('open')) {
            overlay.addClass('active');
        } else {
            overlay.removeClass('active');
        }
    });

    overlay.on('click', function() {
        $(this).removeClass('active');
        $('#sidebar').removeClass('open');
    });

});

// Sidebar constructor
//
// -------------------
$(document).ready(function() {

    var sidebar = $('#sidebar');
    var sidebarHeader = $('#sidebar .sidebar-header');
    var sidebarImg = sidebarHeader.css('background-image');
    var toggleButtons = $('.sidebar-toggle');

    // Hide toggle buttons on default position
    toggleButtons.css('display', 'none');
    $('body').css('display', 'table');


    // Sidebar position
    $('#sidebar-position').change(function() {
        var value = $( this ).val();
        sidebar.removeClass('sidebar-fixed-left sidebar-fixed-right sidebar-stacked').addClass(value).addClass('open');
        if (value == 'sidebar-fixed-left' || value == 'sidebar-fixed-right') {
            $('.sidebar-overlay').addClass('active');
        }
        // Show toggle buttons
        if (value != '') {
            toggleButtons.css('display', 'initial');
            $('body').css('display', 'initial');
        } else {
            // Hide toggle buttons
            toggleButtons.css('display', 'none');
            $('body').css('display', 'table');
        }
    });

    // Sidebar theme
    $('#sidebar-theme').change(function() {
        var value = $( this ).val();
        sidebar.removeClass('sidebar-default sidebar-inverse sidebar-colored sidebar-colored-inverse').addClass(value)
    });

    // Header cover
    $('#sidebar-header').change(function() {
        var value = $(this).val();

        $('.sidebar-header').removeClass('header-cover').addClass(value);

        if (value == 'header-cover') {
            sidebarHeader.css('background-image', sidebarImg)
        } else {
            sidebarHeader.css('background-image', '')
        }
    });
});

/**
 * Created by Kupletsky Sergey on 08.09.14.
 *
 * Add JQuery animation to bootstrap dropdown elements.
 */

(function($) {
    var dropdown = $('.dropdown');

    // Add slidedown animation to dropdown
    dropdown.on('show.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideDown();
    });

    // Add slideup animation to dropdown
    dropdown.on('hide.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideUp();
    });
})(jQuery);



(function(removeClass) {

	jQuery.fn.removeClass = function( value ) {
		if ( value && typeof value.test === "function" ) {
			for ( var i = 0, l = this.length; i < l; i++ ) {
				var elem = this[i];
				if ( elem.nodeType === 1 && elem.className ) {
					var classNames = elem.className.split( /\s+/ );

					for ( var n = classNames.length; n--; ) {
						if ( value.test(classNames[n]) ) {
							classNames.splice(n, 1);
						}
					}
					elem.className = jQuery.trim( classNames.join(" ") );
				}
			}
		} else {
			removeClass.call(this, value);
		}
		return this;
	}

})(jQuery.fn.removeClass);

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

$(function () {
  new FormValidator("post-form", [
      {"name": "slug", "rules": "alpha_dash"}
  ], function (errors, e) {
    e.preventDefault();
    $('.invalid').hide();
    if (errors.length) {
      $("#" + errors[0].id + "-invalid").removeClass("hide").show();
      return;
    }
    $('#post-form').ajaxSubmit({
    success: function (json) {
      if (json.status === "success") {
        alertify.success("Content saved", 'success');
        window.history.pushState({},"", "../" + json.content.Id + "/");
      } else {
        alertify.error(json.msg);
      }
    },
    error: function (json) {
        alertify.error(("Error: " + JSON.parse(json.responseText).msg));
    }
    });
  });
  initUpload("#post-information");
});

$(function () {
  $(".delete-file").on("click",function(e){
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
});

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

$(".delete-post").on("click",function(e){
  e.preventDefault();
  var id = $(this).attr("rel");
  alertify.confirm("Are you sure you want to delete this post?", function() {
    $.ajax({
      "url":"/admin/editor/"+id+"/",
      "type":"delete",
      "success":function(json){
        if(json.status === "success"){
          alertify.success("Post deleted");
          $('#dingo-post-' + id).remove();
        }else{
          alertify.error((JSON.parse(json.responseText).msg));
        }
      }
    });
  });
});


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

$(function () {
  new FormValidator("signup-form", [
      {"name": "password", "rules": "required|min_length[4]|max_length[20]"}
  ], function (errors, e) {
    e.preventDefault();
    $('.invalid').hide();
    if (errors.length) {
      $("#" + errors[0].id + "-invalid").removeClass("hide").show();
      return;
    }
    $('#signup-form').ajaxSubmit({
      success: function (json) {
        window.location.href = "/admin/";
      },
      error: function (json) {
        alertify.error(("Error: " + JSON.parse(json.responseText).msg));
      }
    });
  })
});

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbW1lbnRzLmpzIiwiZWRpdG9yLmpzIiwiZmlsZXMuanMiLCJsb2dpbi5qcyIsInBhc3N3b3JkLmpzIiwicG9zdHMuanMiLCJzZXR0aW5ncy5qcyIsInNpZ251cC5qcyIsInVwbG9hZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgS3VwbGV0c2t5IFNlcmdleSBvbiAxNy4xMC4xNC5cbiAqXG4gKiBNYXRlcmlhbCBTaWRlYmFyIChQcm9maWxlIG1lbnUpXG4gKiBUZXN0ZWQgb24gV2luOC4xIHdpdGggYnJvd3NlcnM6IENocm9tZSAzNywgRmlyZWZveCAzMiwgT3BlcmEgMjUsIElFIDExLCBTYWZhcmkgNS4xLjdcbiAqIFlvdSBjYW4gdXNlIHRoaXMgc2lkZWJhciBpbiBCb290c3RyYXAgKHYzKSBwcm9qZWN0cy4gSFRNTC1tYXJrdXAgbGlrZSBOYXZiYXIgYm9vdHN0cmFwIGNvbXBvbmVudCB3aWxsIG1ha2UgeW91ciB3b3JrIGVhc2llci5cbiAqIERyb3Bkb3duIG1lbnUgYW5kIHNpZGViYXIgdG9nZ2xlIGJ1dHRvbiB3b3JrcyB3aXRoIEpRdWVyeSBhbmQgQm9vdHN0cmFwLm1pbi5qc1xuICovXG5cbi8vIFNpZGViYXIgdG9nZ2xlXG4vL1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLVxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgdmFyIG92ZXJsYXkgPSAkKCcuc2lkZWJhci1vdmVybGF5Jyk7XG5cbiAgICAkKCcuc2lkZWJhci10b2dnbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNpZGViYXIgPSAkKCcjc2lkZWJhcicpO1xuICAgICAgICBzaWRlYmFyLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgIGlmICgoc2lkZWJhci5oYXNDbGFzcygnc2lkZWJhci1maXhlZC1sZWZ0JykgfHwgc2lkZWJhci5oYXNDbGFzcygnc2lkZWJhci1maXhlZC1yaWdodCcpKSAmJiBzaWRlYmFyLmhhc0NsYXNzKCdvcGVuJykpIHtcbiAgICAgICAgICAgIG92ZXJsYXkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3ZlcmxheS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIG92ZXJsYXkub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAkKCcjc2lkZWJhcicpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgfSk7XG5cbn0pO1xuXG4vLyBTaWRlYmFyIGNvbnN0cnVjdG9yXG4vL1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLVxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2lkZWJhciA9ICQoJyNzaWRlYmFyJyk7XG4gICAgdmFyIHNpZGViYXJIZWFkZXIgPSAkKCcjc2lkZWJhciAuc2lkZWJhci1oZWFkZXInKTtcbiAgICB2YXIgc2lkZWJhckltZyA9IHNpZGViYXJIZWFkZXIuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJyk7XG4gICAgdmFyIHRvZ2dsZUJ1dHRvbnMgPSAkKCcuc2lkZWJhci10b2dnbGUnKTtcblxuICAgIC8vIEhpZGUgdG9nZ2xlIGJ1dHRvbnMgb24gZGVmYXVsdCBwb3NpdGlvblxuICAgIHRvZ2dsZUJ1dHRvbnMuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAkKCdib2R5JykuY3NzKCdkaXNwbGF5JywgJ3RhYmxlJyk7XG5cblxuICAgIC8vIFNpZGViYXIgcG9zaXRpb25cbiAgICAkKCcjc2lkZWJhci1wb3NpdGlvbicpLmNoYW5nZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gJCggdGhpcyApLnZhbCgpO1xuICAgICAgICBzaWRlYmFyLnJlbW92ZUNsYXNzKCdzaWRlYmFyLWZpeGVkLWxlZnQgc2lkZWJhci1maXhlZC1yaWdodCBzaWRlYmFyLXN0YWNrZWQnKS5hZGRDbGFzcyh2YWx1ZSkuYWRkQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgaWYgKHZhbHVlID09ICdzaWRlYmFyLWZpeGVkLWxlZnQnIHx8IHZhbHVlID09ICdzaWRlYmFyLWZpeGVkLXJpZ2h0Jykge1xuICAgICAgICAgICAgJCgnLnNpZGViYXItb3ZlcmxheScpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTaG93IHRvZ2dsZSBidXR0b25zXG4gICAgICAgIGlmICh2YWx1ZSAhPSAnJykge1xuICAgICAgICAgICAgdG9nZ2xlQnV0dG9ucy5jc3MoJ2Rpc3BsYXknLCAnaW5pdGlhbCcpO1xuICAgICAgICAgICAgJCgnYm9keScpLmNzcygnZGlzcGxheScsICdpbml0aWFsJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBIaWRlIHRvZ2dsZSBidXR0b25zXG4gICAgICAgICAgICB0b2dnbGVCdXR0b25zLmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICAgICAgICAgICAkKCdib2R5JykuY3NzKCdkaXNwbGF5JywgJ3RhYmxlJyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFNpZGViYXIgdGhlbWVcbiAgICAkKCcjc2lkZWJhci10aGVtZScpLmNoYW5nZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gJCggdGhpcyApLnZhbCgpO1xuICAgICAgICBzaWRlYmFyLnJlbW92ZUNsYXNzKCdzaWRlYmFyLWRlZmF1bHQgc2lkZWJhci1pbnZlcnNlIHNpZGViYXItY29sb3JlZCBzaWRlYmFyLWNvbG9yZWQtaW52ZXJzZScpLmFkZENsYXNzKHZhbHVlKVxuICAgIH0pO1xuXG4gICAgLy8gSGVhZGVyIGNvdmVyXG4gICAgJCgnI3NpZGViYXItaGVhZGVyJykuY2hhbmdlKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xuXG4gICAgICAgICQoJy5zaWRlYmFyLWhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXItY292ZXInKS5hZGRDbGFzcyh2YWx1ZSk7XG5cbiAgICAgICAgaWYgKHZhbHVlID09ICdoZWFkZXItY292ZXInKSB7XG4gICAgICAgICAgICBzaWRlYmFySGVhZGVyLmNzcygnYmFja2dyb3VuZC1pbWFnZScsIHNpZGViYXJJbWcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaWRlYmFySGVhZGVyLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICcnKVxuICAgICAgICB9XG4gICAgfSk7XG59KTtcblxuLyoqXG4gKiBDcmVhdGVkIGJ5IEt1cGxldHNreSBTZXJnZXkgb24gMDguMDkuMTQuXG4gKlxuICogQWRkIEpRdWVyeSBhbmltYXRpb24gdG8gYm9vdHN0cmFwIGRyb3Bkb3duIGVsZW1lbnRzLlxuICovXG5cbihmdW5jdGlvbigkKSB7XG4gICAgdmFyIGRyb3Bkb3duID0gJCgnLmRyb3Bkb3duJyk7XG5cbiAgICAvLyBBZGQgc2xpZGVkb3duIGFuaW1hdGlvbiB0byBkcm9wZG93blxuICAgIGRyb3Bkb3duLm9uKCdzaG93LmJzLmRyb3Bkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICQodGhpcykuZmluZCgnLmRyb3Bkb3duLW1lbnUnKS5maXJzdCgpLnN0b3AodHJ1ZSwgdHJ1ZSkuc2xpZGVEb3duKCk7XG4gICAgfSk7XG5cbiAgICAvLyBBZGQgc2xpZGV1cCBhbmltYXRpb24gdG8gZHJvcGRvd25cbiAgICBkcm9wZG93bi5vbignaGlkZS5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAkKHRoaXMpLmZpbmQoJy5kcm9wZG93bi1tZW51JykuZmlyc3QoKS5zdG9wKHRydWUsIHRydWUpLnNsaWRlVXAoKTtcbiAgICB9KTtcbn0pKGpRdWVyeSk7XG5cblxuXG4oZnVuY3Rpb24ocmVtb3ZlQ2xhc3MpIHtcblxuXHRqUXVlcnkuZm4ucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbiggdmFsdWUgKSB7XG5cdFx0aWYgKCB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudGVzdCA9PT0gXCJmdW5jdGlvblwiICkge1xuXHRcdFx0Zm9yICggdmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKysgKSB7XG5cdFx0XHRcdHZhciBlbGVtID0gdGhpc1tpXTtcblx0XHRcdFx0aWYgKCBlbGVtLm5vZGVUeXBlID09PSAxICYmIGVsZW0uY2xhc3NOYW1lICkge1xuXHRcdFx0XHRcdHZhciBjbGFzc05hbWVzID0gZWxlbS5jbGFzc05hbWUuc3BsaXQoIC9cXHMrLyApO1xuXG5cdFx0XHRcdFx0Zm9yICggdmFyIG4gPSBjbGFzc05hbWVzLmxlbmd0aDsgbi0tOyApIHtcblx0XHRcdFx0XHRcdGlmICggdmFsdWUudGVzdChjbGFzc05hbWVzW25dKSApIHtcblx0XHRcdFx0XHRcdFx0Y2xhc3NOYW1lcy5zcGxpY2UobiwgMSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsZW0uY2xhc3NOYW1lID0galF1ZXJ5LnRyaW0oIGNsYXNzTmFtZXMuam9pbihcIiBcIikgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZW1vdmVDbGFzcy5jYWxsKHRoaXMsIHZhbHVlKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxufSkoalF1ZXJ5LmZuLnJlbW92ZUNsYXNzKTtcbiIsIiQoZnVuY3Rpb24gKCkge1xuICAgICQoJy5jb21tZW50LWRlbGV0ZScpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY29tbWVudCA9ICQodGhpcyk7XG4gICAgICAgIGFsZXJ0aWZ5LmNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgcG9zdD9cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgaWQgPSBjb21tZW50LmF0dHIoXCJyZWxcIik7XG4gICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiZGVsZXRlXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hZG1pbi9jb21tZW50cy8/aWQ9XCIgKyBpZCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgICAgICAgICBhbGVydGlmeS5zdWNjZXNzKFwiQ29tbWVudCBkZWx0ZWRcIik7XG4gICAgICAgICAgICAgICAgICAgICQoJyNjb21tZW50LScgKyBpZCkucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgYWxlcnRpZnkuZXJyb3IoKFwiRXJyb3I6IFwiICsgSlNPTi5wYXJzZShqc29uLnJlc3BvbnNlVGV4dCkubXNnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgICQoJy5jb21tZW50LWFwcHJvdmUnKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNvbW1lbnQgPSAkKHRoaXMpO1xuICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmF0dHIoXCJyZWxcIik7XG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB0eXBlOiBcInB1dFwiLFxuICAgICAgICAgICAgdXJsOiBcIi9hZG1pbi9jb21tZW50cy8/aWQ9XCIgKyBpZCxcbiAgICAgICAgICAgIFwic3VjY2Vzc1wiOmZ1bmN0aW9uKGpzb24pe1xuICAgICAgICAgICAgICAgIGlmKGpzb24uc3RhdHVzID09PSBcInN1Y2Nlc3NcIil7XG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJDb21tZW50IGFwcHJvdmVkXCIpO1xuICAgICAgICAgICAgICAgICAgICBjb21tZW50LnJlbW92ZUNsYXNzKFwiY29tbWVudC1hcHByb3ZlXCIpLnJlbW92ZUNsYXNzKFwibWRsLWNvbG9yLXRleHQtLWdyZWVuXCIpLmFkZENsYXNzKFwiZGlzYWJsZWRcIikuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBjb21tZW50LnVuYmluZCgpO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBhbGVydGlmeS5lcnJvcigoXCJFcnJvcjogXCIgKyBKU09OLnBhcnNlKGpzb24ucmVzcG9uc2VUZXh0KS5tc2cpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG4gICAgJCgnLmNvbW1lbnQtcmVwbHknKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGlkID0gJCh0aGlzKS5hdHRyKFwicmVsXCIpO1xuICAgICAgICAkKCcjY29tbWVudC0nK2lkKS5hZnRlcigkKCcjY29tbWVudC1ibG9jaycpLmRldGFjaCgpLnNob3coKSk7XG4gICAgICAgICQoJyNjb21tZW50LXBhcmVudCcpLnZhbChpZCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbiAgICAkKCcjY29tbWVudC1mb3JtJykuYWpheEZvcm0oe1xuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhcIlN1Y2Nlc2Z1bGx5IHJlcGxpZWRcIik7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL2FkbWluL2NvbW1lbnRzL1wiO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgIGFsZXJ0aWZ5LmVycm9yKChcIkVycm9yOiBcIiArIEpTT04ucGFyc2UoanNvbi5yZXNwb25zZVRleHQpLm1zZykpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgJCgnI2NvbW1lbnQtY2xvc2UnKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oKXtcbiAgICAgICAgJCgnI2NvbW1lbnQtYmxvY2snKS5oaWRlKCk7XG4gICAgICAgICQoJyNjb21tZW50LXBhcmVudCcpLnZhbCgwKTtcbiAgICAgICAgJCgnI2NvbW1lbnQtY29udGVudCcpLnZhbChcIlwiKTtcbiAgICB9KTtcbn0pO1xuIiwiJChmdW5jdGlvbiAoKSB7XG4gIG5ldyBGb3JtVmFsaWRhdG9yKFwicG9zdC1mb3JtXCIsIFtcbiAgICAgIHtcIm5hbWVcIjogXCJzbHVnXCIsIFwicnVsZXNcIjogXCJhbHBoYV9kYXNoXCJ9XG4gIF0sIGZ1bmN0aW9uIChlcnJvcnMsIGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCgnLmludmFsaWQnKS5oaWRlKCk7XG4gICAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICAgICQoXCIjXCIgKyBlcnJvcnNbMF0uaWQgKyBcIi1pbnZhbGlkXCIpLnJlbW92ZUNsYXNzKFwiaGlkZVwiKS5zaG93KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgICQoJyNwb3N0LWZvcm0nKS5hamF4U3VibWl0KHtcbiAgICBzdWNjZXNzOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgaWYgKGpzb24uc3RhdHVzID09PSBcInN1Y2Nlc3NcIikge1xuICAgICAgICBhbGVydGlmeS5zdWNjZXNzKFwiQ29udGVudCBzYXZlZFwiLCAnc3VjY2VzcycpO1xuICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoe30sXCJcIiwgXCIuLi9cIiArIGpzb24uY29udGVudC5JZCArIFwiL1wiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFsZXJ0aWZ5LmVycm9yKGpzb24ubXNnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGVycm9yOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICBhbGVydGlmeS5lcnJvcigoXCJFcnJvcjogXCIgKyBKU09OLnBhcnNlKGpzb24ucmVzcG9uc2VUZXh0KS5tc2cpKTtcbiAgICB9XG4gICAgfSk7XG4gIH0pO1xuICBpbml0VXBsb2FkKFwiI3Bvc3QtaW5mb3JtYXRpb25cIik7XG59KTtcbiIsIiQoZnVuY3Rpb24gKCkge1xuICAkKFwiLmRlbGV0ZS1maWxlXCIpLm9uKFwiY2xpY2tcIixmdW5jdGlvbihlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIG5hbWUgPSAkKHRoaXMpLmF0dHIoXCJuYW1lXCIpO1xuICAgIHZhciBwYXRoID0gJCh0aGlzKS5hdHRyKFwicmVsXCIpO1xuICAgIGFsZXJ0aWZ5LmNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgZmlsZT9cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAkLmFqYXgoe1xuICAgICAgICBcInR5cGVcIjogXCJkZWxldGVcIixcbiAgICAgICAgXCJ1cmxcIjogXCIvYWRtaW4vZmlsZXMvP3BhdGg9XCIgKyBwYXRoLFxuICAgICAgICBcInN1Y2Nlc3NcIjogZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICBpZihqc29uLnN0YXR1cyA9PT0gXCJzdWNjZXNzXCIpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCIjZmlsZS1cIiArIG5hbWUpO1xuICAgICAgICAgICAgJChcIiNmaWxlLVwiICsgbmFtZSkucmVtb3ZlKCk7XG4gICAgICAgICAgICBhbGVydGlmeS5zdWNjZXNzKFwiRmlsZSBkZWxldGVkXCIpO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgYWxlcnQoanNvbi5tc2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iLCIkKGZ1bmN0aW9uICgpIHtcbiAgbmV3IEZvcm1WYWxpZGF0b3IoXCJsb2dpbi1mb3JtXCIsIFtcbiAgICAgIHtcIm5hbWVcIjogXCJwYXNzd29yZFwiLCBcInJ1bGVzXCI6IFwicmVxdWlyZWR8bWluX2xlbmd0aFs0XXxtYXhfbGVuZ3RoWzIwXVwifVxuICBdLCBmdW5jdGlvbiAoZXJyb3JzLCBlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQoJy5pbnZhbGlkJykuaGlkZSgpO1xuICAgIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgICAkKFwiI1wiICsgZXJyb3JzWzBdLmlkICsgXCItaW52YWxpZFwiKS5yZW1vdmVDbGFzcyhcImhpZGVcIikuc2hvdygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICQoJyNsb2dpbi1mb3JtJykuYWpheFN1Ym1pdCh7XG4gICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICBpZiAoanNvbi5zdGF0dXMgPT09IFwiZXJyb3JcIikge1xuICAgICAgICAgIGFsZXJ0aWZ5LmVycm9yKFwiSW5jb3JyZWN0IHVzZXJuYW1lICYgcGFzc3dvcmQgY29tYmluYXRpb24uXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvYWRtaW4vXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcbn0pO1xuIiwiJChmdW5jdGlvbigpe1xuICBuZXcgRm9ybVZhbGlkYXRvcihcInBhc3N3b3JkLWZvcm1cIixbXG4gICAgICB7XCJuYW1lXCI6XCJvbGRcIixcInJ1bGVzXCI6XCJtaW5fbGVuZ3RoWzJdfG1heF9sZW5ndGhbMjBdXCJ9LFxuICAgICAge1wibmFtZVwiOlwibmV3XCIsXCJydWxlc1wiOlwibWluX2xlbmd0aFsyXXxtYXhfbGVuZ3RoWzIwXVwifSxcbiAgICAgIHtcIm5hbWVcIjpcImNvbmZpcm1cIixcInJ1bGVzXCI6XCJyZXF1aXJlZHxtYXRjaGVzW25ld11cIn1cbiAgXSxmdW5jdGlvbihlcnJvcnMsZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQoJy5pbnZhbGlkJykuaGlkZSgpO1xuICAgIGlmKGVycm9ycy5sZW5ndGgpe1xuICAgICAgJChcIiNcIitlcnJvcnNbMF0uaWQrXCItaW52YWxpZFwiKS5yZW1vdmVDbGFzcyhcImhpZGVcIikuc2hvdygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAkKCcjcGFzc3dvcmQnKS5hamF4U3VibWl0KHtcbiAgICAgIFwic3VjY2Vzc1wiOiBmdW5jdGlvbigpIHtcbiAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhcIlBhc3N3b3JkIGNoYW5nZWRcIik7XG4gICAgICB9LFxuICAgICAgXCJlcnJvclwiOiBmdW5jdGlvbigpIHtcbiAgICAgICAgYWxlcnRpZnkuZXJyb3IoKFwiRXJyb3I6IFwiICsgSlNPTi5wYXJzZShqc29uLnJlc3BvbnNlVGV4dCkubXNnKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pXG59KTtcbiIsIiQoXCIuZGVsZXRlLXBvc3RcIikub24oXCJjbGlja1wiLGZ1bmN0aW9uKGUpe1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIHZhciBpZCA9ICQodGhpcykuYXR0cihcInJlbFwiKTtcbiAgYWxlcnRpZnkuY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhpcyBwb3N0P1wiLCBmdW5jdGlvbigpIHtcbiAgICAkLmFqYXgoe1xuICAgICAgXCJ1cmxcIjpcIi9hZG1pbi9lZGl0b3IvXCIraWQrXCIvXCIsXG4gICAgICBcInR5cGVcIjpcImRlbGV0ZVwiLFxuICAgICAgXCJzdWNjZXNzXCI6ZnVuY3Rpb24oanNvbil7XG4gICAgICAgIGlmKGpzb24uc3RhdHVzID09PSBcInN1Y2Nlc3NcIil7XG4gICAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhcIlBvc3QgZGVsZXRlZFwiKTtcbiAgICAgICAgICAkKCcjZGluZ28tcG9zdC0nICsgaWQpLnJlbW92ZSgpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBhbGVydGlmeS5lcnJvcigoSlNPTi5wYXJzZShqc29uLnJlc3BvbnNlVGV4dCkubXNnKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59KTtcblxuIiwiJChmdW5jdGlvbiAoKSB7XG4gICAgJCgnLnNldHRpbmctZm9ybScpLmFqYXhGb3JtKHtcbiAgICAgICAgJ3N1Y2Nlc3MnOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJTYXZlZFwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgJ2Vycm9yJzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBhbGVydGlmeS5lcnJvcigoXCJFcnJvcjogXCIgKyBKU09OLnBhcnNlKGpzb24ucmVzcG9uc2VUZXh0KS5tc2cpKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgICQoXCIjYWRkLWN1c3RvbVwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkKFwiI2N1c3RvbS1zZXR0aW5nc1wiKS5hcHBlbmQoJCgkKHRoaXMpLmF0dHIoXCJyZWxcIikpLmh0bWwoKSk7XG4gICAgICAgIGNvbXBvbmVudEhhbmRsZXIudXBncmFkZURvbSgpO1xuICAgICAgICAkKFwiLmRlbC1jdXN0b21cIikub24oXCJjbGlja1wiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBpZihjb25maXJtKFwiRGVsZXRlIHRoaXMgaXRlbe+8n1wiKSl7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5wYXJlbnQoKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgJChcIiNhZGQtbmF2XCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQoXCIjbmF2aWdhdG9yc1wiKS5hcHBlbmQoJCgkKHRoaXMpLmF0dHIoXCJyZWxcIikpLmh0bWwoKSk7XG4gICAgICAgIGNvbXBvbmVudEhhbmRsZXIudXBncmFkZURvbSgpO1xuICAgICAgICAkKFwiLmRlbC1uYXZcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBpZihjb25maXJtKFwiRGVsZXRlIHRoaXMgaXRlbe+8n1wiKSl7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5wYXJlbnQoKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgJChcIi5kZWwtbmF2XCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmKGNvbmZpcm0oXCJEZWxldGUgdGhpcyBpdGVt77yfXCIpKXtcbiAgICAgICAgICAgICQodGhpcykucGFyZW50KCkucGFyZW50KCkucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAkKFwiLmRlbC1jdXN0b21cIikub24oXCJjbGlja1wiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYoY29uZmlybShcIkRlbGV0ZSB0aGlzIGl0ZW3vvJ9cIikpe1xuICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5wYXJlbnQoKS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufSlcbiIsIiQoZnVuY3Rpb24gKCkge1xuICBuZXcgRm9ybVZhbGlkYXRvcihcInNpZ251cC1mb3JtXCIsIFtcbiAgICAgIHtcIm5hbWVcIjogXCJwYXNzd29yZFwiLCBcInJ1bGVzXCI6IFwicmVxdWlyZWR8bWluX2xlbmd0aFs0XXxtYXhfbGVuZ3RoWzIwXVwifVxuICBdLCBmdW5jdGlvbiAoZXJyb3JzLCBlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQoJy5pbnZhbGlkJykuaGlkZSgpO1xuICAgIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgICAkKFwiI1wiICsgZXJyb3JzWzBdLmlkICsgXCItaW52YWxpZFwiKS5yZW1vdmVDbGFzcyhcImhpZGVcIikuc2hvdygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAkKCcjc2lnbnVwLWZvcm0nKS5hamF4U3VibWl0KHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvYWRtaW4vXCI7XG4gICAgICB9LFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgIGFsZXJ0aWZ5LmVycm9yKChcIkVycm9yOiBcIiArIEpTT04ucGFyc2UoanNvbi5yZXNwb25zZVRleHQpLm1zZykpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KVxufSk7XG4iLCJmdW5jdGlvbiBpbml0VXBsb2FkKHApIHtcbiAgICAkKCcjYXR0YWNoLXNob3cnKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCgnI2F0dGFjaC11cGxvYWQnKS50cmlnZ2VyKFwiY2xpY2tcIik7XG4gICAgfSk7XG4gICAgJCgnI2F0dGFjaC11cGxvYWQnKS5vbihcImNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGFsZXJ0aWZ5LmNvbmZpcm0oXCJVcGxvYWQgbm93P1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBiYXIgPSAkKCc8cCBjbGFzcz1cImZpbGUtcHJvZ3Jlc3MgaW5saW5lLWJsb2NrXCI+MCU8L3A+Jyk7XG4gICAgICAgICAgICAkKCcjYXR0YWNoLWZvcm0nKS5hamF4U3VibWl0KHtcbiAgICAgICAgICAgICAgICBcImJlZm9yZVN1Ym1pdFwiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICQocCkuYmVmb3JlKGJhcik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcInVwbG9hZFByb2dyZXNzXCI6IGZ1bmN0aW9uIChldmVudCwgcG9zaXRpb24sIHRvdGFsLCBwZXJjZW50Q29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBlcmNlbnRWYWwgPSBwZXJjZW50Q29tcGxldGUgKyAnJSc7XG4gICAgICAgICAgICAgICAgICAgIGJhci5jc3MoXCJ3aWR0aFwiLCBwZXJjZW50VmFsKS5odG1sKHBlcmNlbnRWYWwpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJzdWNjZXNzXCI6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChqc29uLnN0YXR1cyA9PT0gXCJlcnJvclwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXIuaHRtbChqc29uLm1zZykuYWRkQ2xhc3MoXCJlcnJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXIucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCA1MDAwKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhci5odG1sKFwiL1wiICsganNvbi5maWxlLnVybCArIFwiJm5ic3A7Jm5ic3A7Jm5ic3A7KEBcIiArIGpzb24uZmlsZS5uYW1lICsgXCIpXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICQoJyNhdHRhY2gtdXBsb2FkJykudmFsKFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY20gPSAkKCcuQ29kZU1pcnJvcicpWzBdLkNvZGVNaXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkb2MgPSBjbS5nZXREb2MoKTtcbiAgICAgICAgICAgICAgICAgICAgZG9jLnJlcGxhY2VTZWxlY3Rpb25zKFtcIiFbXSgvXCIgKyBqc29uLmZpbGUudXJsICsgXCIpXCJdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKHRoaXMpLnZhbChcIlwiKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG4iXX0=
