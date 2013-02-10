$(function() {
    $('.j-presentation').each(function(index, item) {
        new Presentation($(item));
    });
});