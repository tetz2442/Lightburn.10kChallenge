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

    /*
     * Helpers
     */
    function createCloud(svg) {
        var div = document.createElement('div');
        div.className = 'cloud-holder';
        div.innerHTML = svg;
        return div;
    }

    function getWindowTop() {
        //http://stackoverflow.com/questions/3464876/javascript-get-window-x-y-position-for-scroll
        return window.pageYOffset || document.documentElement.scrollTop;
    }

    //http://stackoverflow.com/questions/442404/retrieve-the-position-x-y-of-an-html-element
    function getElementOffsetTop(el) {
        var bodyRect = document.body.getBoundingClientRect(),
            elemRect = el.getBoundingClientRect(),
            offset   = elemRect.top - bodyRect.top;

        return offset;
    }

    /*
     * Logic
     */
    function init() {
        // load rockets in with js
        document.getElementById('js-mn').insertAdjacentHTML('beforeend', document.getElementById('js-rkts').innerHTML);
        // get references to objects after putting them in the html
        rocketWithCLM = document.getElementById('js-rkt-clm');
        rocketWithCMR = document.getElementById('js-rkt-cm-r');

        section3.classList.add('section--expand');
        moon.classList.add('moon--start-top');

        addListeners();
        scrollEvent();
    }

    function addListeners() {
        window.addEventListener('scroll', scrollEvent);
    }

    function scrollEvent() {
        var top = getWindowTop(),
            windowHeight = window.innerHeight;

        timelineScroll(top, windowHeight);
        section2Scroll(top, windowHeight);
        moonScroll(top, windowHeight);
        landingScroll(top, windowHeight);
    }

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

    var belowSection2 = false,
        isRocketShown = true,
        isRocketCLMShown = false,
        isRocketCMShown = false;
    function section2Scroll(windowTop, windowHeight) {
        var rect = section2.getBoundingClientRect();

        // are we below section 2?
        if(rect.top - (windowHeight / 2) <= 0) {
            if(isRocketShown) {
                TweenLite.to(rocket, .15, {autoAlpha: 0});
                TweenLite.to(rocketWithCLM, .15, {autoAlpha: 1});
                isRocketShown = false;
                isRocketCLMShown = true;
                console.log('hide rocket');
            }
            belowSection2 = true;
            rocket.classList.add('rkt--anim-remove');
        }
        else {
            if(!isRocketShown) {
                TweenLite.to(rocket, .15, {autoAlpha: 1});
                TweenLite.to(rocketWithCLM, .15, {autoAlpha: 0});
                isRocketShown = true;
                isRocketCLMShown = false;
                console.log('show rocket');
            }
            firstHit = false;
            belowSection2 = false;
        }
    }

    var isPastSection3 = false;
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
            console.log('show clm');
        }
        else if(isRocketCLMShown && section3Rect.top - (windowHeight / 2) <= 0) {
            TweenLite.to(rocketWithCLM, .25, { autoAlpha: 0 });
            isRocketCLMShown = false;
            console.log('hide clm');
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
                    TweenLite.to(rocketWithCM, .1, {autoAlpha: 0});
                    isRocketCMShown = false;
                    console.log('cm hide');
                }
            }
            // are below section 3 bottom?
            else if (moonBottom >= section3OffsetTop + section3Height) {
                moon.classList.add('moon--bottom');

                if(!isRocketCMShown) {
                    TweenLite.to(rocketWithCM, .15, {autoAlpha: 1});
                    isRocketCMShown = true;
                    console.log('cm show');
                }
            }
        }
    }

    var playingSplashdown = false,
        isRocketCMRShown = false;
    function landingScroll(windowTop, windowHeight) {
        var section4Rect = section4.getBoundingClientRect();

        if(isPastSection3 && section4Rect.top <= 0) {
            var section5Rect = section5.getBoundingClientRect();

            if (isRocketCMRShown && section5Rect.top - (windowHeight / 4) > 0) {
                TweenLite.to(rocketWithCM, .1, {autoAlpha: 1});
                TweenLite.set(rocketWithCMR, {clearProps: 'transform'});
                TweenLite.to(rocketWithCMR, 0, {autoAlpha: 0});
                rocketWithCMR.style.bottom = '';
                rocketWithCMR.classList.remove('rkt--splashdown');
                playingSplashdown = false;
                isRocketCMRShown = false;
                console.log('hide cmr');
            }
            else if (section5Rect.top - (windowHeight / 4) <= 0 || windowTop >= windowTop + windowHeight) {
                if(!isRocketCMRShown) {
                    TweenLite.to(rocketWithCM, .1, {autoAlpha: 0});
                    TweenLite.to(rocketWithCMR, .1, {autoAlpha: 1});
                    isRocketCMRShown = true;
                    console.log('show cmr');
                }

                var section5Offset = getElementOffsetTop(section5),
                    section5Height = section5.clientHeight;
                if(!playingSplashdown && windowTop > section5Offset + (section5Height / 3)) {
                    playingSplashdown = true;
                    var offsetTop = getElementOffsetTop(rocketWithCMR),
                        bodyHeight = document.documentElement.scrollHeight,
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

    if (supports.svg && supports.querySelector) {
        var firstHit = true,
            section2 = document.getElementById('js-s-2'),
            section3 = document.getElementById('js-s-3'),
            section4 = document.getElementById('js-s-4'),
            section5 = document.getElementById('js-s-5'),
            moon = document.getElementById('js-moon'),
            rocket = document.getElementById('js-rkt'),
            rocketWithCM = document.getElementById('js-rkt-cm'),
            earth2 = document.getElementById('js-e-2'),
            timelineItems = document.querySelectorAll('.tm > li:not(.tm__btm)'),
            timelineItemsLength = timelineItems.length,
            timelineBottom = document.getElementById('js-tm-btm'),
            earths = document.querySelectorAll('.earth__circle'),
            rocketWithCLM,
            rocketWithCMR;

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

        loadScript('j/TweenLite.js', function() {
            init();
        });
    }

})(this, this.document);