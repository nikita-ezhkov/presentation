(function() {

    var slider = function($prevSlide, $nextSlide, isRevert) {
        var prevDfd = $.Deferred();
        var nextDfd = $.Deferred();
        var width = $prevSlide.width();
        var ratio = isRevert ? -1 : 1;

        var prevDestPosition = -ratio * width;
        var nextStartPosition = ratio * width;

        $prevSlide.css({
            position: 'absolute',
            top: 0,
            left: '0%',
            display: 'block'
        }).animate({
            left: prevDestPosition
        }, prevDfd.resolve);

        $nextSlide.css({
            position: 'absolute',
            top: 0,
            left: nextStartPosition,
            display: 'block'
        }).animate({
            left: '0%'
        }, nextDfd.resolve);

        return $.when(prevDfd, nextDfd);
    };

    Presentation && Presentation.addTransition('horizontalSlider', slider);

})();