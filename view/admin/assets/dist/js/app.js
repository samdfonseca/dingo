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


$(function(){
    new FormValidator("profile-form",[
        {"name":"slug","rules":"alpha_numeric|min_length[1]|max_length[20]"},
        {"name":"email","rules":"valid_email"},
        {"name":"url","rules":"valid_url"}
    ],function(errors,e) {
        e.preventDefault();
        $('.invalid').hide();
        if(errors.length){
            $("#"+errors[0].id+"-invalid").removeClass("hide").show();
            return;
        }
        $('#profile').ajaxSubmit(function(json){
            if(json.status === "error"){
                alert(json.msg);
            }else{
                alertify.success("Profile saved")
            }
            return false;
        });
    })
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
    });
    $("#add-nav").on("click", function(e) {
        e.preventDefault();
        $("#navigators").append($($(this).attr("rel")).html());
        componentHandler.upgradeDom();

    });
    $('.setting-form').on("click", ".del-nav", function(e) {
        e.preventDefault();
        console.log($(this).parent().parent());
        var item = $(this).parent().parent()
        alertify.confirm("Delete this item?", function() {
            item.remove();
        });
    });
    $('.setting-form').on("click", ".del-custom", function(e) {
        e.preventDefault();
        var item = $(this).parent().parent()
        alertify.confirm("Delete this item?", function() {
            item.remove();
        });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbW1lbnRzLmpzIiwiZWRpdG9yLmpzIiwiZmlsZXMuanMiLCJsb2dpbi5qcyIsInBhc3N3b3JkLmpzIiwicG9zdHMuanMiLCJwcm9maWxlLmpzIiwic2V0dGluZ3MuanMiLCJzaWdudXAuanMiLCJ1cGxvYWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IEt1cGxldHNreSBTZXJnZXkgb24gMTcuMTAuMTQuXG4gKlxuICogTWF0ZXJpYWwgU2lkZWJhciAoUHJvZmlsZSBtZW51KVxuICogVGVzdGVkIG9uIFdpbjguMSB3aXRoIGJyb3dzZXJzOiBDaHJvbWUgMzcsIEZpcmVmb3ggMzIsIE9wZXJhIDI1LCBJRSAxMSwgU2FmYXJpIDUuMS43XG4gKiBZb3UgY2FuIHVzZSB0aGlzIHNpZGViYXIgaW4gQm9vdHN0cmFwICh2MykgcHJvamVjdHMuIEhUTUwtbWFya3VwIGxpa2UgTmF2YmFyIGJvb3RzdHJhcCBjb21wb25lbnQgd2lsbCBtYWtlIHlvdXIgd29yayBlYXNpZXIuXG4gKiBEcm9wZG93biBtZW51IGFuZCBzaWRlYmFyIHRvZ2dsZSBidXR0b24gd29ya3Mgd2l0aCBKUXVlcnkgYW5kIEJvb3RzdHJhcC5taW4uanNcbiAqL1xuXG4vLyBTaWRlYmFyIHRvZ2dsZVxuLy9cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS1cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIHZhciBvdmVybGF5ID0gJCgnLnNpZGViYXItb3ZlcmxheScpO1xuXG4gICAgJCgnLnNpZGViYXItdG9nZ2xlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzaWRlYmFyID0gJCgnI3NpZGViYXInKTtcbiAgICAgICAgc2lkZWJhci50b2dnbGVDbGFzcygnb3BlbicpO1xuICAgICAgICBpZiAoKHNpZGViYXIuaGFzQ2xhc3MoJ3NpZGViYXItZml4ZWQtbGVmdCcpIHx8IHNpZGViYXIuaGFzQ2xhc3MoJ3NpZGViYXItZml4ZWQtcmlnaHQnKSkgJiYgc2lkZWJhci5oYXNDbGFzcygnb3BlbicpKSB7XG4gICAgICAgICAgICBvdmVybGF5LmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG92ZXJsYXkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBvdmVybGF5Lm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgJCgnI3NpZGViYXInKS5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgIH0pO1xuXG59KTtcblxuLy8gU2lkZWJhciBjb25zdHJ1Y3RvclxuLy9cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS1cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNpZGViYXIgPSAkKCcjc2lkZWJhcicpO1xuICAgIHZhciBzaWRlYmFySGVhZGVyID0gJCgnI3NpZGViYXIgLnNpZGViYXItaGVhZGVyJyk7XG4gICAgdmFyIHNpZGViYXJJbWcgPSBzaWRlYmFySGVhZGVyLmNzcygnYmFja2dyb3VuZC1pbWFnZScpO1xuICAgIHZhciB0b2dnbGVCdXR0b25zID0gJCgnLnNpZGViYXItdG9nZ2xlJyk7XG5cbiAgICAvLyBIaWRlIHRvZ2dsZSBidXR0b25zIG9uIGRlZmF1bHQgcG9zaXRpb25cbiAgICB0b2dnbGVCdXR0b25zLmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICAgJCgnYm9keScpLmNzcygnZGlzcGxheScsICd0YWJsZScpO1xuXG5cbiAgICAvLyBTaWRlYmFyIHBvc2l0aW9uXG4gICAgJCgnI3NpZGViYXItcG9zaXRpb24nKS5jaGFuZ2UoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9ICQoIHRoaXMgKS52YWwoKTtcbiAgICAgICAgc2lkZWJhci5yZW1vdmVDbGFzcygnc2lkZWJhci1maXhlZC1sZWZ0IHNpZGViYXItZml4ZWQtcmlnaHQgc2lkZWJhci1zdGFja2VkJykuYWRkQ2xhc3ModmFsdWUpLmFkZENsYXNzKCdvcGVuJyk7XG4gICAgICAgIGlmICh2YWx1ZSA9PSAnc2lkZWJhci1maXhlZC1sZWZ0JyB8fCB2YWx1ZSA9PSAnc2lkZWJhci1maXhlZC1yaWdodCcpIHtcbiAgICAgICAgICAgICQoJy5zaWRlYmFyLW92ZXJsYXknKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2hvdyB0b2dnbGUgYnV0dG9uc1xuICAgICAgICBpZiAodmFsdWUgIT0gJycpIHtcbiAgICAgICAgICAgIHRvZ2dsZUJ1dHRvbnMuY3NzKCdkaXNwbGF5JywgJ2luaXRpYWwnKTtcbiAgICAgICAgICAgICQoJ2JvZHknKS5jc3MoJ2Rpc3BsYXknLCAnaW5pdGlhbCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gSGlkZSB0b2dnbGUgYnV0dG9uc1xuICAgICAgICAgICAgdG9nZ2xlQnV0dG9ucy5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICAgICAgICAgICAgJCgnYm9keScpLmNzcygnZGlzcGxheScsICd0YWJsZScpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBTaWRlYmFyIHRoZW1lXG4gICAgJCgnI3NpZGViYXItdGhlbWUnKS5jaGFuZ2UoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9ICQoIHRoaXMgKS52YWwoKTtcbiAgICAgICAgc2lkZWJhci5yZW1vdmVDbGFzcygnc2lkZWJhci1kZWZhdWx0IHNpZGViYXItaW52ZXJzZSBzaWRlYmFyLWNvbG9yZWQgc2lkZWJhci1jb2xvcmVkLWludmVyc2UnKS5hZGRDbGFzcyh2YWx1ZSlcbiAgICB9KTtcblxuICAgIC8vIEhlYWRlciBjb3ZlclxuICAgICQoJyNzaWRlYmFyLWhlYWRlcicpLmNoYW5nZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gJCh0aGlzKS52YWwoKTtcblxuICAgICAgICAkKCcuc2lkZWJhci1oZWFkZXInKS5yZW1vdmVDbGFzcygnaGVhZGVyLWNvdmVyJykuYWRkQ2xhc3ModmFsdWUpO1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PSAnaGVhZGVyLWNvdmVyJykge1xuICAgICAgICAgICAgc2lkZWJhckhlYWRlci5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCBzaWRlYmFySW1nKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2lkZWJhckhlYWRlci5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAnJylcbiAgICAgICAgfVxuICAgIH0pO1xufSk7XG5cbi8qKlxuICogQ3JlYXRlZCBieSBLdXBsZXRza3kgU2VyZ2V5IG9uIDA4LjA5LjE0LlxuICpcbiAqIEFkZCBKUXVlcnkgYW5pbWF0aW9uIHRvIGJvb3RzdHJhcCBkcm9wZG93biBlbGVtZW50cy5cbiAqL1xuXG4oZnVuY3Rpb24oJCkge1xuICAgIHZhciBkcm9wZG93biA9ICQoJy5kcm9wZG93bicpO1xuXG4gICAgLy8gQWRkIHNsaWRlZG93biBhbmltYXRpb24gdG8gZHJvcGRvd25cbiAgICBkcm9wZG93bi5vbignc2hvdy5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAkKHRoaXMpLmZpbmQoJy5kcm9wZG93bi1tZW51JykuZmlyc3QoKS5zdG9wKHRydWUsIHRydWUpLnNsaWRlRG93bigpO1xuICAgIH0pO1xuXG4gICAgLy8gQWRkIHNsaWRldXAgYW5pbWF0aW9uIHRvIGRyb3Bkb3duXG4gICAgZHJvcGRvd24ub24oJ2hpZGUuYnMuZHJvcGRvd24nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgJCh0aGlzKS5maW5kKCcuZHJvcGRvd24tbWVudScpLmZpcnN0KCkuc3RvcCh0cnVlLCB0cnVlKS5zbGlkZVVwKCk7XG4gICAgfSk7XG59KShqUXVlcnkpO1xuXG5cblxuKGZ1bmN0aW9uKHJlbW92ZUNsYXNzKSB7XG5cblx0alF1ZXJ5LmZuLnJlbW92ZUNsYXNzID0gZnVuY3Rpb24oIHZhbHVlICkge1xuXHRcdGlmICggdmFsdWUgJiYgdHlwZW9mIHZhbHVlLnRlc3QgPT09IFwiZnVuY3Rpb25cIiApIHtcblx0XHRcdGZvciAoIHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrICkge1xuXHRcdFx0XHR2YXIgZWxlbSA9IHRoaXNbaV07XG5cdFx0XHRcdGlmICggZWxlbS5ub2RlVHlwZSA9PT0gMSAmJiBlbGVtLmNsYXNzTmFtZSApIHtcblx0XHRcdFx0XHR2YXIgY2xhc3NOYW1lcyA9IGVsZW0uY2xhc3NOYW1lLnNwbGl0KCAvXFxzKy8gKTtcblxuXHRcdFx0XHRcdGZvciAoIHZhciBuID0gY2xhc3NOYW1lcy5sZW5ndGg7IG4tLTsgKSB7XG5cdFx0XHRcdFx0XHRpZiAoIHZhbHVlLnRlc3QoY2xhc3NOYW1lc1tuXSkgKSB7XG5cdFx0XHRcdFx0XHRcdGNsYXNzTmFtZXMuc3BsaWNlKG4sIDEpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbGVtLmNsYXNzTmFtZSA9IGpRdWVyeS50cmltKCBjbGFzc05hbWVzLmpvaW4oXCIgXCIpICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVtb3ZlQ2xhc3MuY2FsbCh0aGlzLCB2YWx1ZSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbn0pKGpRdWVyeS5mbi5yZW1vdmVDbGFzcyk7XG4iLCIkKGZ1bmN0aW9uICgpIHtcbiAgICAkKCcuY29tbWVudC1kZWxldGUnKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNvbW1lbnQgPSAkKHRoaXMpO1xuICAgICAgICBhbGVydGlmeS5jb25maXJtKFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSB0aGlzIHBvc3Q/XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGlkID0gY29tbWVudC5hdHRyKFwicmVsXCIpO1xuICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImRlbGV0ZVwiLFxuICAgICAgICAgICAgICAgIHVybDogXCIvYWRtaW4vY29tbWVudHMvP2lkPVwiICsgaWQsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhcIkNvbW1lbnQgZGVsdGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICAkKCcjY29tbWVudC0nICsgaWQpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0aWZ5LmVycm9yKChcIkVycm9yOiBcIiArIEpTT04ucGFyc2UoanNvbi5yZXNwb25zZVRleHQpLm1zZykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICAkKCcuY29tbWVudC1hcHByb3ZlJykub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjb21tZW50ID0gJCh0aGlzKTtcbiAgICAgICAgdmFyIGlkID0gJCh0aGlzKS5hdHRyKFwicmVsXCIpO1xuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdHlwZTogXCJwdXRcIixcbiAgICAgICAgICAgIHVybDogXCIvYWRtaW4vY29tbWVudHMvP2lkPVwiICsgaWQsXG4gICAgICAgICAgICBcInN1Y2Nlc3NcIjpmdW5jdGlvbihqc29uKXtcbiAgICAgICAgICAgICAgICBpZihqc29uLnN0YXR1cyA9PT0gXCJzdWNjZXNzXCIpe1xuICAgICAgICAgICAgICAgICAgICBhbGVydGlmeS5zdWNjZXNzKFwiQ29tbWVudCBhcHByb3ZlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudC5yZW1vdmVDbGFzcyhcImNvbW1lbnQtYXBwcm92ZVwiKS5yZW1vdmVDbGFzcyhcIm1kbC1jb2xvci10ZXh0LS1ncmVlblwiKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudC51bmJpbmQoKTtcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgYWxlcnRpZnkuZXJyb3IoKFwiRXJyb3I6IFwiICsgSlNPTi5wYXJzZShqc29uLnJlc3BvbnNlVGV4dCkubXNnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuICAgICQoJy5jb21tZW50LXJlcGx5Jykub24oXCJjbGlja1wiLGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBpZCA9ICQodGhpcykuYXR0cihcInJlbFwiKTtcbiAgICAgICAgJCgnI2NvbW1lbnQtJytpZCkuYWZ0ZXIoJCgnI2NvbW1lbnQtYmxvY2snKS5kZXRhY2goKS5zaG93KCkpO1xuICAgICAgICAkKCcjY29tbWVudC1wYXJlbnQnKS52YWwoaWQpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG4gICAgJCgnI2NvbW1lbnQtZm9ybScpLmFqYXhGb3JtKHtcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJTdWNjZXNmdWxseSByZXBsaWVkXCIpO1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9hZG1pbi9jb21tZW50cy9cIjtcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICBhbGVydGlmeS5lcnJvcigoXCJFcnJvcjogXCIgKyBKU09OLnBhcnNlKGpzb24ucmVzcG9uc2VUZXh0KS5tc2cpKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgICQoJyNjb21tZW50LWNsb3NlJykub24oXCJjbGlja1wiLGZ1bmN0aW9uKCl7XG4gICAgICAgICQoJyNjb21tZW50LWJsb2NrJykuaGlkZSgpO1xuICAgICAgICAkKCcjY29tbWVudC1wYXJlbnQnKS52YWwoMCk7XG4gICAgICAgICQoJyNjb21tZW50LWNvbnRlbnQnKS52YWwoXCJcIik7XG4gICAgfSk7XG59KTtcbiIsIiQoZnVuY3Rpb24gKCkge1xuICBuZXcgRm9ybVZhbGlkYXRvcihcInBvc3QtZm9ybVwiLCBbXG4gICAgICB7XCJuYW1lXCI6IFwic2x1Z1wiLCBcInJ1bGVzXCI6IFwiYWxwaGFfZGFzaFwifVxuICBdLCBmdW5jdGlvbiAoZXJyb3JzLCBlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQoJy5pbnZhbGlkJykuaGlkZSgpO1xuICAgIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgICAkKFwiI1wiICsgZXJyb3JzWzBdLmlkICsgXCItaW52YWxpZFwiKS5yZW1vdmVDbGFzcyhcImhpZGVcIikuc2hvdygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAkKCcjcG9zdC1mb3JtJykuYWpheFN1Ym1pdCh7XG4gICAgc3VjY2VzczogZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgIGlmIChqc29uLnN0YXR1cyA9PT0gXCJzdWNjZXNzXCIpIHtcbiAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhcIkNvbnRlbnQgc2F2ZWRcIiwgJ3N1Y2Nlc3MnKTtcbiAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKHt9LFwiXCIsIFwiLi4vXCIgKyBqc29uLmNvbnRlbnQuSWQgKyBcIi9cIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhbGVydGlmeS5lcnJvcihqc29uLm1zZyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBlcnJvcjogZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgYWxlcnRpZnkuZXJyb3IoKFwiRXJyb3I6IFwiICsgSlNPTi5wYXJzZShqc29uLnJlc3BvbnNlVGV4dCkubXNnKSk7XG4gICAgfVxuICAgIH0pO1xuICB9KTtcbiAgaW5pdFVwbG9hZChcIiNwb3N0LWluZm9ybWF0aW9uXCIpO1xufSk7XG4iLCIkKGZ1bmN0aW9uICgpIHtcbiAgJChcIi5kZWxldGUtZmlsZVwiKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBuYW1lID0gJCh0aGlzKS5hdHRyKFwibmFtZVwiKTtcbiAgICB2YXIgcGF0aCA9ICQodGhpcykuYXR0cihcInJlbFwiKTtcbiAgICBhbGVydGlmeS5jb25maXJtKFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSB0aGlzIGZpbGU/XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgJC5hamF4KHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiZGVsZXRlXCIsXG4gICAgICAgIFwidXJsXCI6IFwiL2FkbWluL2ZpbGVzLz9wYXRoPVwiICsgcGF0aCxcbiAgICAgICAgXCJzdWNjZXNzXCI6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgaWYoanNvbi5zdGF0dXMgPT09IFwic3VjY2Vzc1wiKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiI2ZpbGUtXCIgKyBuYW1lKTtcbiAgICAgICAgICAgICQoXCIjZmlsZS1cIiArIG5hbWUpLnJlbW92ZSgpO1xuICAgICAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhcIkZpbGUgZGVsZXRlZFwiKTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGFsZXJ0KGpzb24ubXNnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIiwiJChmdW5jdGlvbiAoKSB7XG4gIG5ldyBGb3JtVmFsaWRhdG9yKFwibG9naW4tZm9ybVwiLCBbXG4gICAgICB7XCJuYW1lXCI6IFwicGFzc3dvcmRcIiwgXCJydWxlc1wiOiBcInJlcXVpcmVkfG1pbl9sZW5ndGhbNF18bWF4X2xlbmd0aFsyMF1cIn1cbiAgXSwgZnVuY3Rpb24gKGVycm9ycywgZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKCcuaW52YWxpZCcpLmhpZGUoKTtcbiAgICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgICAgJChcIiNcIiArIGVycm9yc1swXS5pZCArIFwiLWludmFsaWRcIikucmVtb3ZlQ2xhc3MoXCJoaWRlXCIpLnNob3coKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAkKCcjbG9naW4tZm9ybScpLmFqYXhTdWJtaXQoe1xuICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgaWYgKGpzb24uc3RhdHVzID09PSBcImVycm9yXCIpIHtcbiAgICAgICAgICBhbGVydGlmeS5lcnJvcihcIkluY29ycmVjdCB1c2VybmFtZSAmIHBhc3N3b3JkIGNvbWJpbmF0aW9uLlwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL2FkbWluL1wiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0pXG59KTtcbiIsIiQoZnVuY3Rpb24oKXtcbiAgbmV3IEZvcm1WYWxpZGF0b3IoXCJwYXNzd29yZC1mb3JtXCIsW1xuICAgICAge1wibmFtZVwiOlwib2xkXCIsXCJydWxlc1wiOlwibWluX2xlbmd0aFsyXXxtYXhfbGVuZ3RoWzIwXVwifSxcbiAgICAgIHtcIm5hbWVcIjpcIm5ld1wiLFwicnVsZXNcIjpcIm1pbl9sZW5ndGhbMl18bWF4X2xlbmd0aFsyMF1cIn0sXG4gICAgICB7XCJuYW1lXCI6XCJjb25maXJtXCIsXCJydWxlc1wiOlwicmVxdWlyZWR8bWF0Y2hlc1tuZXddXCJ9XG4gIF0sZnVuY3Rpb24oZXJyb3JzLGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKCcuaW52YWxpZCcpLmhpZGUoKTtcbiAgICBpZihlcnJvcnMubGVuZ3RoKXtcbiAgICAgICQoXCIjXCIrZXJyb3JzWzBdLmlkK1wiLWludmFsaWRcIikucmVtb3ZlQ2xhc3MoXCJoaWRlXCIpLnNob3coKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgJCgnI3Bhc3N3b3JkJykuYWpheFN1Ym1pdCh7XG4gICAgICBcInN1Y2Nlc3NcIjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJQYXNzd29yZCBjaGFuZ2VkXCIpO1xuICAgICAgfSxcbiAgICAgIFwiZXJyb3JcIjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGFsZXJ0aWZ5LmVycm9yKChcIkVycm9yOiBcIiArIEpTT04ucGFyc2UoanNvbi5yZXNwb25zZVRleHQpLm1zZykpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KVxufSk7XG4iLCIkKFwiLmRlbGV0ZS1wb3N0XCIpLm9uKFwiY2xpY2tcIixmdW5jdGlvbihlKXtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB2YXIgaWQgPSAkKHRoaXMpLmF0dHIoXCJyZWxcIik7XG4gIGFsZXJ0aWZ5LmNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgcG9zdD9cIiwgZnVuY3Rpb24oKSB7XG4gICAgJC5hamF4KHtcbiAgICAgIFwidXJsXCI6XCIvYWRtaW4vZWRpdG9yL1wiK2lkK1wiL1wiLFxuICAgICAgXCJ0eXBlXCI6XCJkZWxldGVcIixcbiAgICAgIFwic3VjY2Vzc1wiOmZ1bmN0aW9uKGpzb24pe1xuICAgICAgICBpZihqc29uLnN0YXR1cyA9PT0gXCJzdWNjZXNzXCIpe1xuICAgICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJQb3N0IGRlbGV0ZWRcIik7XG4gICAgICAgICAgJCgnI2RpbmdvLXBvc3QtJyArIGlkKS5yZW1vdmUoKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgYWxlcnRpZnkuZXJyb3IoKEpTT04ucGFyc2UoanNvbi5yZXNwb25zZVRleHQpLm1zZykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbiIsIiQoZnVuY3Rpb24oKXtcbiAgICBuZXcgRm9ybVZhbGlkYXRvcihcInByb2ZpbGUtZm9ybVwiLFtcbiAgICAgICAge1wibmFtZVwiOlwic2x1Z1wiLFwicnVsZXNcIjpcImFscGhhX251bWVyaWN8bWluX2xlbmd0aFsxXXxtYXhfbGVuZ3RoWzIwXVwifSxcbiAgICAgICAge1wibmFtZVwiOlwiZW1haWxcIixcInJ1bGVzXCI6XCJ2YWxpZF9lbWFpbFwifSxcbiAgICAgICAge1wibmFtZVwiOlwidXJsXCIsXCJydWxlc1wiOlwidmFsaWRfdXJsXCJ9XG4gICAgXSxmdW5jdGlvbihlcnJvcnMsZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQoJy5pbnZhbGlkJykuaGlkZSgpO1xuICAgICAgICBpZihlcnJvcnMubGVuZ3RoKXtcbiAgICAgICAgICAgICQoXCIjXCIrZXJyb3JzWzBdLmlkK1wiLWludmFsaWRcIikucmVtb3ZlQ2xhc3MoXCJoaWRlXCIpLnNob3coKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAkKCcjcHJvZmlsZScpLmFqYXhTdWJtaXQoZnVuY3Rpb24oanNvbil7XG4gICAgICAgICAgICBpZihqc29uLnN0YXR1cyA9PT0gXCJlcnJvclwiKXtcbiAgICAgICAgICAgICAgICBhbGVydChqc29uLm1zZyk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBhbGVydGlmeS5zdWNjZXNzKFwiUHJvZmlsZSBzYXZlZFwiKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9KVxufSk7XG4iLCIkKGZ1bmN0aW9uICgpIHtcbiAgICAkKCcuc2V0dGluZy1mb3JtJykuYWpheEZvcm0oe1xuICAgICAgICAnc3VjY2Vzcyc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhcIlNhdmVkXCIpO1xuICAgICAgICB9LFxuICAgICAgICAnZXJyb3InOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFsZXJ0aWZ5LmVycm9yKChcIkVycm9yOiBcIiArIEpTT04ucGFyc2UoanNvbi5yZXNwb25zZVRleHQpLm1zZykpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgJChcIiNhZGQtY3VzdG9tXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQoXCIjY3VzdG9tLXNldHRpbmdzXCIpLmFwcGVuZCgkKCQodGhpcykuYXR0cihcInJlbFwiKSkuaHRtbCgpKTtcbiAgICAgICAgY29tcG9uZW50SGFuZGxlci51cGdyYWRlRG9tKCk7XG4gICAgfSk7XG4gICAgJChcIiNhZGQtbmF2XCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQoXCIjbmF2aWdhdG9yc1wiKS5hcHBlbmQoJCgkKHRoaXMpLmF0dHIoXCJyZWxcIikpLmh0bWwoKSk7XG4gICAgICAgIGNvbXBvbmVudEhhbmRsZXIudXBncmFkZURvbSgpO1xuXG4gICAgfSk7XG4gICAgJCgnLnNldHRpbmctZm9ybScpLm9uKFwiY2xpY2tcIiwgXCIuZGVsLW5hdlwiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc29sZS5sb2coJCh0aGlzKS5wYXJlbnQoKS5wYXJlbnQoKSk7XG4gICAgICAgIHZhciBpdGVtID0gJCh0aGlzKS5wYXJlbnQoKS5wYXJlbnQoKVxuICAgICAgICBhbGVydGlmeS5jb25maXJtKFwiRGVsZXRlIHRoaXMgaXRlbT9cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpdGVtLnJlbW92ZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICAkKCcuc2V0dGluZy1mb3JtJykub24oXCJjbGlja1wiLCBcIi5kZWwtY3VzdG9tXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgaXRlbSA9ICQodGhpcykucGFyZW50KCkucGFyZW50KClcbiAgICAgICAgYWxlcnRpZnkuY29uZmlybShcIkRlbGV0ZSB0aGlzIGl0ZW0/XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaXRlbS5yZW1vdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KVxuIiwiJChmdW5jdGlvbiAoKSB7XG4gIG5ldyBGb3JtVmFsaWRhdG9yKFwic2lnbnVwLWZvcm1cIiwgW1xuICAgICAge1wibmFtZVwiOiBcInBhc3N3b3JkXCIsIFwicnVsZXNcIjogXCJyZXF1aXJlZHxtaW5fbGVuZ3RoWzRdfG1heF9sZW5ndGhbMjBdXCJ9XG4gIF0sIGZ1bmN0aW9uIChlcnJvcnMsIGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCgnLmludmFsaWQnKS5oaWRlKCk7XG4gICAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICAgICQoXCIjXCIgKyBlcnJvcnNbMF0uaWQgKyBcIi1pbnZhbGlkXCIpLnJlbW92ZUNsYXNzKFwiaGlkZVwiKS5zaG93KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgICQoJyNzaWdudXAtZm9ybScpLmFqYXhTdWJtaXQoe1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9hZG1pbi9cIjtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgYWxlcnRpZnkuZXJyb3IoKFwiRXJyb3I6IFwiICsgSlNPTi5wYXJzZShqc29uLnJlc3BvbnNlVGV4dCkubXNnKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pXG59KTtcbiIsImZ1bmN0aW9uIGluaXRVcGxvYWQocCkge1xuICAgICQoJyNhdHRhY2gtc2hvdycpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAkKCcjYXR0YWNoLXVwbG9hZCcpLnRyaWdnZXIoXCJjbGlja1wiKTtcbiAgICB9KTtcbiAgICAkKCcjYXR0YWNoLXVwbG9hZCcpLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYWxlcnRpZnkuY29uZmlybShcIlVwbG9hZCBub3c/XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGJhciA9ICQoJzxwIGNsYXNzPVwiZmlsZS1wcm9ncmVzcyBpbmxpbmUtYmxvY2tcIj4wJTwvcD4nKTtcbiAgICAgICAgICAgICQoJyNhdHRhY2gtZm9ybScpLmFqYXhTdWJtaXQoe1xuICAgICAgICAgICAgICAgIFwiYmVmb3JlU3VibWl0XCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgJChwKS5iZWZvcmUoYmFyKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwidXBsb2FkUHJvZ3Jlc3NcIjogZnVuY3Rpb24gKGV2ZW50LCBwb3NpdGlvbiwgdG90YWwsIHBlcmNlbnRDb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGVyY2VudFZhbCA9IHBlcmNlbnRDb21wbGV0ZSArICclJztcbiAgICAgICAgICAgICAgICAgICAgYmFyLmNzcyhcIndpZHRoXCIsIHBlcmNlbnRWYWwpLmh0bWwocGVyY2VudFZhbCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcInN1Y2Nlc3NcIjogZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzb24uc3RhdHVzID09PSBcImVycm9yXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhci5odG1sKGpzb24ubXNnKS5hZGRDbGFzcyhcImVyclwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhci5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDUwMDApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhcIkZpbGUgaGFzIGJlZW4gdXBsb2FkZWQuXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBiYXIuaHRtbChcIi9cIiArIGpzb24uZmlsZS51cmwgKyBcIiZuYnNwOyZuYnNwOyZuYnNwOyhAXCIgKyBqc29uLmZpbGUubmFtZSArIFwiKVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAkKCcjYXR0YWNoLXVwbG9hZCcpLnZhbChcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNtID0gJCgnLkNvZGVNaXJyb3InKVswXS5Db2RlTWlycm9yO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZG9jID0gY20uZ2V0RG9jKCk7XG4gICAgICAgICAgICAgICAgICAgIGRvYy5yZXBsYWNlU2VsZWN0aW9ucyhbXCIhW10oL1wiICsganNvbi5maWxlLnVybCArIFwiKVwiXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCh0aGlzKS52YWwoXCJcIik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuIl19
