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

    /* Scroll watcher */
    function Watchers() {
        var self = this;

        window.addEventListener('scroll', function() {
            var top = getWindowTop();
            for (var i = 0; i < self.scrollCallbacks.length; i++) {
                self.scrollCallbacks[i](top);
            }
        });
        window.addEventListener('resize', function() {
            for (var i = 0; i < self.resizeCallbacks.length; i++) {
                self.resizeCallbacks[i]();
            }
        });

        return this;
    }

    Watchers.prototype.scrollCallbacks = [];
    Watchers.prototype.resizeCallbacks = [];

    Watchers.prototype.addScrollCallback = function(callback, callImmediately) {
        this.scrollCallbacks.push(callback);
        if(callImmediately) callback(getWindowTop());
    };

    Watchers.prototype.addResizeCallback = function(callback) {
        this.resizeCallbacks.push(callback);
    };

    var watcher = new Watchers();

    /*
     * Logic
     */
    var section2 = document.getElementById('js-s-2'),
        section3 = document.getElementById('js-s-3'),
        moon = document.getElementById('js-moon'),
        rocket = document.getElementById('js-rocket');

    function init() {
        section3.classList.add('section--expand');
        moon.classList.add('moon--start-top');

        watcher.addScrollCallback(section2Scroll, true);
        watcher.addScrollCallback(moonScroll, true);
    }

    function section2Scroll(windowTop) {
        var rect = section2.getBoundingClientRect();
        //console.log(rect);
        if(rect.top - window.innerHeight <= 0) {
            rocket.classList.add('rocket--animate-top');
            rocket.classList.add('rocket--delay-remove');
        }
        else {
            rocket.classList.remove('rocket--animate-top');
        }
    }

    var inPastSection3 = false;
    function moonScroll(windowTop) {
        var windowHeight = window.innerHeight,
            moonHeight = moon.clientHeight,
            section3Rect = section3.getBoundingClientRect(),
            fromTop = (windowHeight - moonHeight) / 2;

        // are we above section 3?
        if(section3Rect.top - fromTop > 0) {
            moon.classList.remove('moon--fixed');
            rocket.classList.remove('rocket--hide');
            inPastSection3 = false;
        }
        // are we below section 3?
        else if(section3Rect.top - fromTop <= 0) {
            moon.classList.add('moon--fixed');
            rocket.classList.add('rocket--hide');
            inPastSection3 = true;
        }

        if(inPastSection3) {
            var section3Height = section3.clientHeight,
                section3OffsetTop = getElementOffsetTop(section3),
                moonOffsetTop = getElementOffsetTop(moon),
                moonBottom = moonOffsetTop + moonHeight;

            // are we above the bottom of section 3?
            if (windowTop < section3OffsetTop + section3Height + fromTop - windowHeight) {
                moon.classList.remove('moon--bottom');
                rocket.classList.add('rocket--hide');
                rocket.classList.remove('rocket--command');
            }
            // are below section 3 bottom?
            else if (moonBottom >= section3OffsetTop + section3Height) {
                moon.classList.add('moon--bottom');

                console.log('below section 3')
                if(!rocket.classList.contains('rocket--command')) {
                    rocket.classList.add('rocket--command');
                }
                rocket.classList.remove('rocket--hide');
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
        var cloud;

        ajax.send({
            url: 'svgs/cl.svg',
            type: 'get',
            success: function(data) {
                var earths = document.querySelectorAll('.earth__circle');

                for(var i = 0; i < earths.length; i++) {
                    earths[i].appendChild(createCloud(data));
                    earths[i].appendChild(createCloud(data));
                    earths[i].appendChild(createCloud(data));
                    earths[i].appendChild(createCloud(data));
                }
            }
        });

        //loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/1.18.4/TweenMax.min.js', function() {
            init();
        //});
    }

})(this, this.document);