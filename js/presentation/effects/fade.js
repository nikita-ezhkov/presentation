(function() {

    var slider = function($prevSlide, $nextSlide, isRevert) {
        var Dfd = $.Deferred();

        $prevSlide.css({
            display: 'block'
        });

        $nextSlide.fadeTo(0, 0);
        $nextSlide.css({
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 100
        });

        $nextSlide.animate({
            opacity: 1
        }, Dfd.resolve);

        return Dfd;
    };

    Presentation && Presentation.addTransition('fade', slider);

})();