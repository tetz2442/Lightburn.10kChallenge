(function(window, document) {
    'use strict';

    /*
     * Simple ajax class
     */
    function Ajax() { }

    Ajax.prototype.createXHR = function() {
        return new XMLHttpRequest();
    };

    Ajax.prototype.send = function(options) {
        var self = this,
            xhr = this.createXHR();

        xhr.open( options.type, options.url );

        xhr.onload = function() {
            // Determine if successful
            var isSuccess = xhr.status >= 200 && xhr.status < 300 || xhr.status === 304;

            if(isSuccess) {
                self.onSuccess(options, xhr);
            }
            else {
                self.onError(options, xhr);
            }
        };

        xhr.onerror = function() {
            self.onError(options, xhr);
        };

        xhr.send(options.data || null);
    };

    Ajax.prototype.onSuccess = function(options, xhr) {
        if(options.success) {
            options.success(xhr.responseText, xhr);
        }
    };

    Ajax.prototype.onError = function(options, xhr) {
        if(options.error) {
            options.error(xhr, xhr.status, xhr.responseText);
        }
    };

    /*
     * Helpers
     */
    // load a script file
    function loadScript(url, callback) {
        var script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = function () {
            callback();
        };

        document.head.appendChild(script);
    }

    function createCloud(svg) {
        var div = document.createElement('div');
        div.className = 'cld-h';
        div.innerHTML = svg;
        return div;
    }

    // Helper to get the window top position
    function getWindowTop() {
        //http://stackoverflow.com/questions/3464876/javascript-get-window-x-y-position-for-scroll
        return window.pageYOffset || document.documentElement.scrollTop;
    }

    // http://stackoverflow.com/questions/442404/retrieve-the-position-x-y-of-an-html-element
    function getElementOffsetTop(el) {
        var bodyRect = document.body.getBoundingClientRect(),
            elemRect = el.getBoundingClientRect(),
            offset   = elemRect.top - bodyRect.top;

        return offset;
    }

    // http://sampsonblog.com/749/simple-throttle-function
    function throttle (callback, limit) {
        var wait = false;                 // Initially, we're not waiting
        return function () {              // We return a throttled function
            if (!wait) {                  // If we're not waiting
                callback.call();          // Execute users function
                wait = true;              // Prevent future invocations
                setTimeout(function () {  // After a period of time
                    wait = false;         // And allow future invocations
                }, limit);
            }
        }
    }

    /*
     * Logic
     */
    var belowSection2 = false,
        isRocketShown = true,
        isRocketCLMShown = false,
        isRocketCMShown = false,
        isPastSection3 = false,
        playingSplashdown = false,
        isRocketCMRShown = false;

    function init() {
        // load rockets in with js
        document.getElementsByTagName('main')[0].insertAdjacentHTML('beforeend', document.getElementById('js-rkts').innerHTML);
        moon.insertAdjacentHTML('beforeend', document.getElementById('js-mn').innerHTML);
        // get references to objects after putting them in the html
        rocketWithCLM = document.getElementById('js-rkt-clm');
        rocketWithCMR = document.getElementById('js-rkt-cm-r');
        rocketWithCM = document.getElementById('js-rkt-cm')

        section3.classList.add('section--expand');
        moon.classList.add('moon--start-top');

        addListeners();
        scrollEvent();
    }

    function addListeners() {
        // throttling this will reduce the calls by 50%
        window.addEventListener('scroll', throttle(scrollEvent, 50));
    }

    function scrollEvent() {
        var top = getWindowTop(),
            windowHeight = window.innerHeight;

        timelineScroll(top, windowHeight);
        section2Scroll(top, windowHeight);
        moonScroll(top, windowHeight);
        landingScroll(top, windowHeight);
    }

    /*
     * Checks if a timeline element is in the viewport
     */
    function timelineScroll(windowTop, windowHeight) {
        for(var i = 0; i < timelineItemsLength; i++) {
            if(!timelineItems[i].classList.contains('show')) {
                var offsetTop = getElementOffsetTop(timelineItems[i]);
                if(offsetTop < windowTop + windowHeight) {
                    timelineItems[i].classList.add('show');
                }
            }

        }
    }

    /*
     * Handles first rocket transition
     */
    function section2Scroll(windowTop, windowHeight) {
        var rect = section2.getBoundingClientRect();

        // are we below section 2?
        if(rect.top - (windowHeight / 2) <= 0) {
            rocket.classList.add('rkt--anim-remove');
            if(isRocketShown) {
                if(!firstHit) {
                    TweenLite.to(rocket, 1.2, {
                        y: '-100%',
                        ease: Power0.easeIn,
                        onComplete: function () {
                            TweenLite.set(rocket, {
                                clearProps: 'transform',
                                autoAlpha: 0
                            });
                        }
                    });
                }
                else {
                    TweenLite.to(rocket, 0, { autoAlpha: 0 });
                }
                TweenLite.to(rocketWithCLM, .15, { autoAlpha: 1 });
                isRocketShown = false;
                isRocketCLMShown = true;
            }
            belowSection2 = true;
        }
        else {
            if(!isRocketShown) {
                TweenLite.killTweensOf(rocket);
                TweenLite.set(rocket, {
                    clearProps: 'transform'
                });
                TweenLite.to(rocket, .15, { autoAlpha: 1 });
                TweenLite.to(rocketWithCLM, .15, { autoAlpha: 0 });
                isRocketShown = true;
                isRocketCLMShown = false;
            }
            belowSection2 = false;
        }
        firstHit = false;
    }

    /*
     * Handles the moon portion, fixes the moon to the viewport
     */
    function moonScroll(windowTop, windowHeight) {
        var moonHeight = moon.clientHeight,
            section3Rect = section3.getBoundingClientRect(),
            fromTop = (windowHeight - moonHeight) / 2;

        // are we above section 3?
        if(section3Rect.top - fromTop > 0) {
            moon.classList.remove('moon--fixed');
            isPastSection3 = false;
        }
        // are we below section 3?
        else if(section3Rect.top - fromTop <= 0) {
            moon.classList.add('moon--fixed');
            isPastSection3 = true;
        }

        // should we hide/show the command and lunar module?
        if(!isRocketCLMShown && belowSection2 && section3Rect.top - (windowHeight / 2) > 0) {
            TweenLite.to(rocketWithCLM, .25, {autoAlpha: 1});
            isRocketCLMShown = true;
        }
        else if(isRocketCLMShown && section3Rect.top - (windowHeight / 2) <= 0) {
            TweenLite.to(rocketWithCLM, .25, { autoAlpha: 0 });
            isRocketCLMShown = false;
        }

        if(isPastSection3) {
            var section3Height = section3.clientHeight,
                section3OffsetTop = getElementOffsetTop(section3),
                moonOffsetTop = getElementOffsetTop(moon),
                moonBottom = moonOffsetTop + moonHeight;

            // are we above the bottom of section 3 and moving up?
            if (windowTop < section3OffsetTop + section3Height + fromTop - windowHeight) {
                moon.classList.remove('moon--bottom');

                if(isRocketCMShown) {
                    TweenLite.to(rocketWithCM, .1, { autoAlpha: 0 });
                    isRocketCMShown = false;
                }
            }
            // are below section 3 bottom?
            else if (moonBottom >= section3OffsetTop + section3Height) {
                moon.classList.add('moon--bottom');

                if(!isRocketCMShown) {
                    TweenLite.to(rocketWithCM, .15, { autoAlpha: 1 });
                    isRocketCMShown = true;
                }
            }
        }
    }

    /*
     * Handles the bottom portion of the rocket logic, shows/hides the command module and splashdown animation
     */
    function landingScroll(windowTop, windowHeight) {
        var section4Rect = section4.getBoundingClientRect();

        if(isPastSection3 && section4Rect.top <= 0) {
            var section5Rect = section5.getBoundingClientRect();

            if (isRocketCMRShown && section5Rect.top - (windowHeight / 4) > 0) {
                TweenLite.killTweensOf(rocketWithCM);
                TweenLite.set(rocketWithCM, {
                    clearProps: 'transform'
                });
                TweenLite.to(rocketWithCM, .1, { autoAlpha: 1 });
                TweenLite.set(rocketWithCMR, { clearProps: 'transform', autoAlpha: 0 });
                rocketWithCMR.style.bottom = '';
                rocketWithCMR.classList.remove('rkt--splashdown');
                playingSplashdown = false;
                isRocketCMRShown = false;
            }
            else if (section5Rect.top - (windowHeight / 4) <= 0) {
                if(!isRocketCMRShown) {
                    rocketWithCM.classList.add('rkt--anim-remove');
                    TweenLite.to(rocketWithCM, 1, {
                        y: '-200%',
                        ease: Power0.easeIn,
                        onComplete: function() {
                            TweenLite.set(rocketWithCM, {
                                clearProps: 'transform',
                                autoAlpha: 0
                            });
                            rocketWithCM.classList.remove('rkt--anim-remove');
                        }
                    });
                    TweenLite.to(rocketWithCMR, .1, { autoAlpha: 1 });
                    isRocketCMRShown = true;
                }

                var section5Offset = getElementOffsetTop(section5),
                    section5Height = section5.clientHeight,
                    bodyHeight = document.documentElement.scrollHeight;

                if(!playingSplashdown && (windowTop > section5Offset + (section5Height / 3) || windowTop + windowHeight === bodyHeight)) {
                    playingSplashdown = true;
                    var offsetTop = getElementOffsetTop(rocketWithCMR),
                        earthOffset = getElementOffsetTop(earth2),
                        bottom = bodyHeight - offsetTop,
                        earthBottom = bottom - (bodyHeight - earthOffset) + (windowHeight * 0.05);

                    rocketWithCMR.style.bottom = bodyHeight - offsetTop + 'px';
                    rocketWithCMR.classList.add('rkt--splashdown');
                    TweenLite.to(rocketWithCMR, 1, {
                        rotation: 180,
                        y: '+=' + earthBottom * 0.5,
                        ease: Power0.easeNone
                    });
                    TweenLite.to(rocketWithCMR, 1.5, {
                        y: '+=' + earthBottom * 0.5,
                        ease: Power1.easeOut,
                        delay: 1,
                        onComplete: function() {
                            timelineBottom.classList.add('show');
                        }
                    });
                }
            }
        }
    }

    /*
     * Figure out what the current browser supports
     */
    var supports = {},
        ajax = new Ajax();
    supports.querySelector = "querySelectorAll" in document;
    supports.svg = document.implementation && document.implementation.hasFeature && document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
    supports.classList = "classList" in document.createElement("_");

    if (supports.svg && supports.querySelector && supports.classList) {
        var firstHit = true,
            section2 = document.querySelector('.sec--2'),
            section3 = document.querySelector('.sec--3'),
            section4 = document.querySelector('.sec--4'),
            section5 = document.querySelector('.sec--5'),
            moon = document.querySelector('.moon'),
            rocket = document.getElementById('js-rkt'),
            earth2 = document.querySelector('.earth--btm'),
            timelineItems = document.querySelectorAll('.tm > li:not(.tm__btm)'),
            timelineItemsLength = timelineItems.length,
            timelineBottom = document.getElementById('js-tm-btm'),
            earths = document.querySelectorAll('.earth__c'),
            rocketWithCM,
            rocketWithCLM,
            rocketWithCMR;

        // gets the clouds via ajax
        ajax.send({
            url: 's/cl.svg',
            type: 'get',
            success: function(data) {
                for(var i = 0; i < earths.length; i++) {
                    earths[i].appendChild(createCloud(data));
                    earths[i].appendChild(createCloud(data));
                }
            }
        });
        // there are two different looking clouds
        ajax.send({
            url: 's/cl2.svg',
            type: 'get',
            success: function(data) {
                for(var i = 0; i < earths.length; i++) {
                    earths[i].appendChild(createCloud(data));
                    earths[i].appendChild(createCloud(data));
                }
            }
        });

        // after tweenlite is loaded, start the other logic
        loadScript('j/TweenLite.js', function() {
            init();
        });
    }
    // if they are in an older browser let them access the content by acting like they don't have js
    else {
        document.getElementsByTagName('html')[0].className = 'no-js';
    }

})(this, this.document);