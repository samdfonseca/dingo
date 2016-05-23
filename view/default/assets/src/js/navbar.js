$(document).ready(function () {
    $('#mobile-nav-trigger').click(function (el) {
        el.preventDefault();

        var nav = $('#nav');

        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            $(this).html('Show Navigation');
            nav.find('ul.nav').slideUp('fast').removeClass('active');
        } else {
            $(this).addClass('active');
            $(this).html('Close Navigation');
            nav.find('ul.nav').slideDown('fast').addClass('active');
        }
    });
});

