(function() {

    var $document = $(document);

    var hashNameRE = '[#&]{%name%}_(\\d+)';
    var statesRE = '\\s*,\\s*';

    var Presentation = function($container) {
        var data = $container.data();

        this.__options = {
            name: data.presentationName,
            transition: data.transition
        };

        this.__$container = $container;
        this.__$slides = $container.find('.j-presentation-slide');
        this.__$rewButton = $container.find('.j-presentation-rew');
        this.__$prevButton = $container.find('.j-presentation-prev');
        this.__$nextButton = $container.find('.j-presentation-next');
        this.__$ffButton = $container.find('.j-presentation-ff');
        this.__$positionInput = $container.find('.j-presentation-currentPosition');

        if (this.__options.name) {
            this.__nameRegExp = new RegExp(hashNameRE.replace('{%name%}', this.__options.name), 'i');
        }

        this.__isLoaded = true;
        this.__index = this.__getCurrentIndex();
        this.__maxIndex = this.__$slides.length - 1;

        this.__bindListeners();
        this.__updateClassNames();
        this.__updateInputValue();
        this.__updateNavigation(true);

        this.showSlide(this.__getHashIndex());

        this.__$positionInput.removeProp('disabled');
        $container.find('.j-presentation-length').text(this.__maxIndex + 1);
        $container.data('presentation', this);
    };

    Presentation.addTransition = function(name, transition) {
        this.prototype.__transitions[name] = transition;
    };

    Presentation.prototype.enableKeys = function() {
        if (!this.__isListentrsEnabled) {
            this.__isListentrsEnabled = true;
            this.disableKeys();

            $document.on('keydown.presentation', this.__documentKeydownHandler);
        }
    };

    Presentation.prototype.disableKeys = function() {
        $document.off('keydown.presentation');
        this.__isListentrsEnabled = false;
    };

    Presentation.prototype.next = function() {
        if (this.__isLoaded) {
            var $currentSlide = this.__$slides.eq(this.__index);
            var stages = $currentSlide.data('stages');

            if (typeof stages === 'string') {
                stages = stages.split(new RegExp(statesRE, 'gi'));
                $currentSlide.data('stages', stages);
            }

            if (stages && stages.length) {
                $currentSlide.removeClass(this.__prevousState);
                this.__prevousState = stages.shift();
                $currentSlide.addClass(this.__prevousState);
            } else {
                this.__prevousState = '';
                this.showSlide(this.__index + 1);
            }
        }
    };

    Presentation.prototype.prev = function() {
        this.showSlide(this.__index - 1);
    };

    Presentation.prototype.toStart = function() {
        this.showSlide(0);
    };

    Presentation.prototype.toEnd = function() {
        this.showSlide(this.__maxIndex);
    };

    Presentation.prototype.showSlide = function(index) {
        var self = this;
        var prevIndex = this.__index;
        var transition;
        var $prevSlide;
        var $nextSlide;

        if (this.__isLoaded && index !== this.__index && this.__isValidIndex(index)) {
            self.__isLoaded = false;

            $prevSlide = this.__$slides.eq(this.__index);
            $nextSlide = this.__$slides.eq(index);

            this.__$slides.removeClass('active');
            this.__prevIndex = this.__index;
            this.__index = index;

            this.__updateInputValue();
            this.__updateClassNames();
            this.__updateNavigation();
            this.__updateHash();

            transition = this.__getTransition($nextSlide);
            transition($prevSlide, $nextSlide, index < prevIndex).done(function() {
                self.__$slides.removeAttr('style');
                $nextSlide.addClass('active');

                self.__isLoaded = true;
            });
        }
    };

    Presentation.prototype.__transitions = {
        __default: function() {
            return $.Deferred().resolve();
        }
    };

    Presentation.prototype.__bindListeners = function() {
        var self = this;

        this.__documentKeydownHandler = $.proxy(this.__documentKeydownHandler, this);
        this.__$container.click(function() {
            self.enableKeys();
        });

        this.__$nextButton.on('click', function(e) {
            self.next();
            e.preventDefault();
        });

        this.__$prevButton.on('click', function(e) {
            self.prev();
            e.preventDefault();
        });

        this.__$rewButton.on('click', function(e) {
            self.showSlide(0);
            e.preventDefault();
        });

        this.__$ffButton.on('click', function(e) {
            self.showSlide(self.__maxIndex);
            e.preventDefault();
        });

        this.__$positionInput.on({
            blur: $.proxy(this.__applyInputValue, this),
            focus: $.proxy(this.__inputFocusHandler, this),
            keydown: $.proxy(this.__inputKeydownHandler, this)
        });
    };

    Presentation.prototype.__getCurrentIndex = function() {
        for (var i = 0; i <= this.__maxIndex; i++) {
            if (this.__$slides.eq(i).hasClass('current')) {
                return i;
            }
        }

        return 0;
    };

    Presentation.prototype.__getHashIndex = function() {
        var hash = location.hash;
        var index = 0;
        var testIndex;
        var splitedHash;

        if (this.__nameRegExp && hash.length) {
            splitedHash = hash.match(this.__nameRegExp);

            if (splitedHash && this.__isValidIndex(testIndex = splitedHash[1] - 1)) {
                index = testIndex;
            }
        }

        return index;
    };

    Presentation.prototype.__getTransition = function($slide) {
        var transition;
        var names = [
            $slide.data('transition'),
            this.__options.transition,
            '__default'
        ];

        while (!(transition = this.__transitions[names.shift()])) {}
        return transition;
    };

    Presentation.prototype.__updateClassNames = function() {
        var $slides = this.__$slides;
        var $current = $slides.eq(this.__index);
        var $lastCurrent;

        if (!$current.hasClass('current')) {
            $lastCurrent = $slides.filter('.current');

            $lastCurrent.prev('.prev').removeClass('prev');
            $lastCurrent.next('.next').removeClass('next');
            $lastCurrent.removeClass('current');

            $current.prev().addClass('prev');
            $current.next().addClass('next');
            $current.addClass('current');
        }
    };

    Presentation.prototype.__updateInputValue = function() {
        this.__$positionInput.val(this.__index + 1);
    };

    Presentation.prototype.__updateNavigation = function(isForce) {
        if (this.__index === 0) {
            this.__$rewButton.removeClass('active');
            this.__$prevButton.removeClass('active');
        } else if (this.__prevIndex === 0 || isForce) {
            this.__$rewButton.addClass('active');
            this.__$prevButton.addClass('active');
        }

        if (this.__index === this.__maxIndex) {
            this.__$nextButton.removeClass('active');
            this.__$ffButton.removeClass('active');
        } else if (this.__prevIndex === this.__maxIndex || isForce) {
            this.__$nextButton.addClass('active');
            this.__$ffButton.addClass('active');
        }
    };

    Presentation.prototype.__updateHash = function(slideIndex) {
        var self = this;
        var hash = location.hash;

        if (isNaN(slideIndex)) {
            slideIndex = self.__index;
        }

        if (this.__options.name) {
            slideIndex++;

            if (!hash) {
                location.hash = this.__options.name + '_' + slideIndex;
            } else if (hash.match(this.__nameRegExp)) {
                location.hash = hash.replace(this.__nameRegExp, function(fullIndex, index) {
                    return fullIndex.replace(index, slideIndex);
                });
            } else {
                location.hash += '&' + this.__options.name + '_' + slideIndex
            }
        }
    };

    Presentation.prototype.__documentKeydownHandler = function(e) {
        var isCatched = true;
        var target = e.target;
        var tagName = target.tagName.toLocaleLowerCase();

        if (tagName !== 'input' && tagName !==  'textarea' && !target.contenteditable) {
            switch (e.which) {
                case 27:
                    this.disableKeys();
                    break;
                case 37:
                    this.prev();
                    break;
                case 32:
                case 39:
                    this.next();
                    break;
                default:
                    isCatched = false;
            }

            if (isCatched) {
                e.preventDefault();
            }
        }
    };

    Presentation.prototype.__inputKeydownHandler = function(e) {
        if (e.which === 13) {
            this.__applyInputValue();
        } else if (e.which === 27) {
            this.__updateInputValue();
            this.__blurInput();
        }
    };

    Presentation.prototype.__inputFocusHandler = function(e) {
        var value = this.__$positionInput.val();
        var el = this.__$positionInput[0];

        if (el.setSelectionRange) {
            el.setSelectionRange(0, value.length);
        } else if (el.createTextRange) {
            var range = el.createTextRange();

            range.collapse(true);
            range.moveEnd('character', 0);
            range.moveStart('character', value - 1);
            range.select();
        }

        this.__$positionInput.one('mouseup', false);
    };

    Presentation.prototype.__blurInput = function() {
        if (this.__$positionInput.length) {
            this.__$positionInput[0].blur();
        }
    };

    Presentation.prototype.__applyInputValue = function() {
        var index = Number(this.__$positionInput.val()) - 1;

        if (!isNaN(index) && this.__isValidIndex(index)) {
            this.showSlide(index);
        } else {
            this.__updateInputValue();
        }

        this.__blurInput();
    };

    Presentation.prototype.__isValidIndex = function(index) {
        return index >= 0 && index <= this.__maxIndex;
    };


    window.Presentation = Presentation;

})();