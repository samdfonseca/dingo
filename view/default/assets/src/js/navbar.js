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

