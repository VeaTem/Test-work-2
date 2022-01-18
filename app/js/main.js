$(function() {
    $('.slider__inner').slick({
        slidesToShow: 4,
        responsive: [{
                breakpoint: 1250,
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 900,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 700,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    });

    $('.burger').on('click', function(e) {
        $('.user-nav').toggleClass('user-nav--active');
    })
});