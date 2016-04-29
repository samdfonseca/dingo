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

$(".del").on("click",function(e){
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
          alertify.error(("Error: " + JSON.parse(json.responseText).msg));
        }
      }
    });
  });
});


function initUpload(p) {
    $('#attach-show').on("click", function () {
        $('#attach-upload').trigger("click");
    });
    $('#attach-upload').on("change", function () {
        if (confirm("Upload now?")) {
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
        } else {
            $(this).val("");
        }
    });
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsInBvc3RzLmpzIiwidXBsb2FkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgS3VwbGV0c2t5IFNlcmdleSBvbiAxNy4xMC4xNC5cbiAqXG4gKiBNYXRlcmlhbCBTaWRlYmFyIChQcm9maWxlIG1lbnUpXG4gKiBUZXN0ZWQgb24gV2luOC4xIHdpdGggYnJvd3NlcnM6IENocm9tZSAzNywgRmlyZWZveCAzMiwgT3BlcmEgMjUsIElFIDExLCBTYWZhcmkgNS4xLjdcbiAqIFlvdSBjYW4gdXNlIHRoaXMgc2lkZWJhciBpbiBCb290c3RyYXAgKHYzKSBwcm9qZWN0cy4gSFRNTC1tYXJrdXAgbGlrZSBOYXZiYXIgYm9vdHN0cmFwIGNvbXBvbmVudCB3aWxsIG1ha2UgeW91ciB3b3JrIGVhc2llci5cbiAqIERyb3Bkb3duIG1lbnUgYW5kIHNpZGViYXIgdG9nZ2xlIGJ1dHRvbiB3b3JrcyB3aXRoIEpRdWVyeSBhbmQgQm9vdHN0cmFwLm1pbi5qc1xuICovXG5cbi8vIFNpZGViYXIgdG9nZ2xlXG4vL1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLVxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgdmFyIG92ZXJsYXkgPSAkKCcuc2lkZWJhci1vdmVybGF5Jyk7XG5cbiAgICAkKCcuc2lkZWJhci10b2dnbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNpZGViYXIgPSAkKCcjc2lkZWJhcicpO1xuICAgICAgICBzaWRlYmFyLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgIGlmICgoc2lkZWJhci5oYXNDbGFzcygnc2lkZWJhci1maXhlZC1sZWZ0JykgfHwgc2lkZWJhci5oYXNDbGFzcygnc2lkZWJhci1maXhlZC1yaWdodCcpKSAmJiBzaWRlYmFyLmhhc0NsYXNzKCdvcGVuJykpIHtcbiAgICAgICAgICAgIG92ZXJsYXkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3ZlcmxheS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIG92ZXJsYXkub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAkKCcjc2lkZWJhcicpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgfSk7XG5cbn0pO1xuXG4vLyBTaWRlYmFyIGNvbnN0cnVjdG9yXG4vL1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLVxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2lkZWJhciA9ICQoJyNzaWRlYmFyJyk7XG4gICAgdmFyIHNpZGViYXJIZWFkZXIgPSAkKCcjc2lkZWJhciAuc2lkZWJhci1oZWFkZXInKTtcbiAgICB2YXIgc2lkZWJhckltZyA9IHNpZGViYXJIZWFkZXIuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJyk7XG4gICAgdmFyIHRvZ2dsZUJ1dHRvbnMgPSAkKCcuc2lkZWJhci10b2dnbGUnKTtcblxuICAgIC8vIEhpZGUgdG9nZ2xlIGJ1dHRvbnMgb24gZGVmYXVsdCBwb3NpdGlvblxuICAgIHRvZ2dsZUJ1dHRvbnMuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAkKCdib2R5JykuY3NzKCdkaXNwbGF5JywgJ3RhYmxlJyk7XG5cblxuICAgIC8vIFNpZGViYXIgcG9zaXRpb25cbiAgICAkKCcjc2lkZWJhci1wb3NpdGlvbicpLmNoYW5nZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gJCggdGhpcyApLnZhbCgpO1xuICAgICAgICBzaWRlYmFyLnJlbW92ZUNsYXNzKCdzaWRlYmFyLWZpeGVkLWxlZnQgc2lkZWJhci1maXhlZC1yaWdodCBzaWRlYmFyLXN0YWNrZWQnKS5hZGRDbGFzcyh2YWx1ZSkuYWRkQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgaWYgKHZhbHVlID09ICdzaWRlYmFyLWZpeGVkLWxlZnQnIHx8IHZhbHVlID09ICdzaWRlYmFyLWZpeGVkLXJpZ2h0Jykge1xuICAgICAgICAgICAgJCgnLnNpZGViYXItb3ZlcmxheScpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTaG93IHRvZ2dsZSBidXR0b25zXG4gICAgICAgIGlmICh2YWx1ZSAhPSAnJykge1xuICAgICAgICAgICAgdG9nZ2xlQnV0dG9ucy5jc3MoJ2Rpc3BsYXknLCAnaW5pdGlhbCcpO1xuICAgICAgICAgICAgJCgnYm9keScpLmNzcygnZGlzcGxheScsICdpbml0aWFsJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBIaWRlIHRvZ2dsZSBidXR0b25zXG4gICAgICAgICAgICB0b2dnbGVCdXR0b25zLmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICAgICAgICAgICAkKCdib2R5JykuY3NzKCdkaXNwbGF5JywgJ3RhYmxlJyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFNpZGViYXIgdGhlbWVcbiAgICAkKCcjc2lkZWJhci10aGVtZScpLmNoYW5nZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gJCggdGhpcyApLnZhbCgpO1xuICAgICAgICBzaWRlYmFyLnJlbW92ZUNsYXNzKCdzaWRlYmFyLWRlZmF1bHQgc2lkZWJhci1pbnZlcnNlIHNpZGViYXItY29sb3JlZCBzaWRlYmFyLWNvbG9yZWQtaW52ZXJzZScpLmFkZENsYXNzKHZhbHVlKVxuICAgIH0pO1xuXG4gICAgLy8gSGVhZGVyIGNvdmVyXG4gICAgJCgnI3NpZGViYXItaGVhZGVyJykuY2hhbmdlKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xuXG4gICAgICAgICQoJy5zaWRlYmFyLWhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXItY292ZXInKS5hZGRDbGFzcyh2YWx1ZSk7XG5cbiAgICAgICAgaWYgKHZhbHVlID09ICdoZWFkZXItY292ZXInKSB7XG4gICAgICAgICAgICBzaWRlYmFySGVhZGVyLmNzcygnYmFja2dyb3VuZC1pbWFnZScsIHNpZGViYXJJbWcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaWRlYmFySGVhZGVyLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICcnKVxuICAgICAgICB9XG4gICAgfSk7XG59KTtcblxuLyoqXG4gKiBDcmVhdGVkIGJ5IEt1cGxldHNreSBTZXJnZXkgb24gMDguMDkuMTQuXG4gKlxuICogQWRkIEpRdWVyeSBhbmltYXRpb24gdG8gYm9vdHN0cmFwIGRyb3Bkb3duIGVsZW1lbnRzLlxuICovXG5cbihmdW5jdGlvbigkKSB7XG4gICAgdmFyIGRyb3Bkb3duID0gJCgnLmRyb3Bkb3duJyk7XG5cbiAgICAvLyBBZGQgc2xpZGVkb3duIGFuaW1hdGlvbiB0byBkcm9wZG93blxuICAgIGRyb3Bkb3duLm9uKCdzaG93LmJzLmRyb3Bkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICQodGhpcykuZmluZCgnLmRyb3Bkb3duLW1lbnUnKS5maXJzdCgpLnN0b3AodHJ1ZSwgdHJ1ZSkuc2xpZGVEb3duKCk7XG4gICAgfSk7XG5cbiAgICAvLyBBZGQgc2xpZGV1cCBhbmltYXRpb24gdG8gZHJvcGRvd25cbiAgICBkcm9wZG93bi5vbignaGlkZS5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAkKHRoaXMpLmZpbmQoJy5kcm9wZG93bi1tZW51JykuZmlyc3QoKS5zdG9wKHRydWUsIHRydWUpLnNsaWRlVXAoKTtcbiAgICB9KTtcbn0pKGpRdWVyeSk7XG5cblxuXG4oZnVuY3Rpb24ocmVtb3ZlQ2xhc3MpIHtcblxuXHRqUXVlcnkuZm4ucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbiggdmFsdWUgKSB7XG5cdFx0aWYgKCB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudGVzdCA9PT0gXCJmdW5jdGlvblwiICkge1xuXHRcdFx0Zm9yICggdmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKysgKSB7XG5cdFx0XHRcdHZhciBlbGVtID0gdGhpc1tpXTtcblx0XHRcdFx0aWYgKCBlbGVtLm5vZGVUeXBlID09PSAxICYmIGVsZW0uY2xhc3NOYW1lICkge1xuXHRcdFx0XHRcdHZhciBjbGFzc05hbWVzID0gZWxlbS5jbGFzc05hbWUuc3BsaXQoIC9cXHMrLyApO1xuXG5cdFx0XHRcdFx0Zm9yICggdmFyIG4gPSBjbGFzc05hbWVzLmxlbmd0aDsgbi0tOyApIHtcblx0XHRcdFx0XHRcdGlmICggdmFsdWUudGVzdChjbGFzc05hbWVzW25dKSApIHtcblx0XHRcdFx0XHRcdFx0Y2xhc3NOYW1lcy5zcGxpY2UobiwgMSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsZW0uY2xhc3NOYW1lID0galF1ZXJ5LnRyaW0oIGNsYXNzTmFtZXMuam9pbihcIiBcIikgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZW1vdmVDbGFzcy5jYWxsKHRoaXMsIHZhbHVlKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxufSkoalF1ZXJ5LmZuLnJlbW92ZUNsYXNzKTtcbiIsIiQoXCIuZGVsXCIpLm9uKFwiY2xpY2tcIixmdW5jdGlvbihlKXtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB2YXIgaWQgPSAkKHRoaXMpLmF0dHIoXCJyZWxcIik7XG4gIGFsZXJ0aWZ5LmNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgcG9zdD9cIiwgZnVuY3Rpb24oKSB7XG4gICAgJC5hamF4KHtcbiAgICAgIFwidXJsXCI6XCIvYWRtaW4vZWRpdG9yL1wiK2lkK1wiL1wiLFxuICAgICAgXCJ0eXBlXCI6XCJkZWxldGVcIixcbiAgICAgIFwic3VjY2Vzc1wiOmZ1bmN0aW9uKGpzb24pe1xuICAgICAgICBpZihqc29uLnN0YXR1cyA9PT0gXCJzdWNjZXNzXCIpe1xuICAgICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJQb3N0IGRlbGV0ZWRcIik7XG4gICAgICAgICAgJCgnI2RpbmdvLXBvc3QtJyArIGlkKS5yZW1vdmUoKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgYWxlcnRpZnkuZXJyb3IoKFwiRXJyb3I6IFwiICsgSlNPTi5wYXJzZShqc29uLnJlc3BvbnNlVGV4dCkubXNnKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59KTtcblxuIiwiZnVuY3Rpb24gaW5pdFVwbG9hZChwKSB7XG4gICAgJCgnI2F0dGFjaC1zaG93Jykub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoJyNhdHRhY2gtdXBsb2FkJykudHJpZ2dlcihcImNsaWNrXCIpO1xuICAgIH0pO1xuICAgICQoJyNhdHRhY2gtdXBsb2FkJykub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoY29uZmlybShcIlVwbG9hZCBub3c/XCIpKSB7XG4gICAgICAgICAgICB2YXIgYmFyID0gJCgnPHAgY2xhc3M9XCJmaWxlLXByb2dyZXNzIGlubGluZS1ibG9ja1wiPjAlPC9wPicpO1xuICAgICAgICAgICAgJCgnI2F0dGFjaC1mb3JtJykuYWpheFN1Ym1pdCh7XG4gICAgICAgICAgICAgICAgXCJiZWZvcmVTdWJtaXRcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAkKHApLmJlZm9yZShiYXIpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJ1cGxvYWRQcm9ncmVzc1wiOiBmdW5jdGlvbiAoZXZlbnQsIHBvc2l0aW9uLCB0b3RhbCwgcGVyY2VudENvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwZXJjZW50VmFsID0gcGVyY2VudENvbXBsZXRlICsgJyUnO1xuICAgICAgICAgICAgICAgICAgICBiYXIuY3NzKFwid2lkdGhcIiwgcGVyY2VudFZhbCkuaHRtbChwZXJjZW50VmFsKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwic3VjY2Vzc1wiOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoanNvbi5zdGF0dXMgPT09IFwiZXJyb3JcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFyLmh0bWwoanNvbi5tc2cpLmFkZENsYXNzKFwiZXJyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFyLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgNTAwMCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXIuaHRtbChcIi9cIiArIGpzb24uZmlsZS51cmwgKyBcIiZuYnNwOyZuYnNwOyZuYnNwOyhAXCIgKyBqc29uLmZpbGUubmFtZSArIFwiKVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAkKCcjYXR0YWNoLXVwbG9hZCcpLnZhbChcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNtID0gJCgnLkNvZGVNaXJyb3InKVswXS5Db2RlTWlycm9yO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZG9jID0gY20uZ2V0RG9jKCk7XG4gICAgICAgICAgICAgICAgICAgIGRvYy5yZXBsYWNlU2VsZWN0aW9ucyhbXCIhW10oL1wiICsganNvbi5maWxlLnVybCArIFwiKVwiXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKHRoaXMpLnZhbChcIlwiKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuIl19
