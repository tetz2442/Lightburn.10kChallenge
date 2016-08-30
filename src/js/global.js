(function(window, document, undefined) {
    'use strict';

    var supports = {};
    supports.querySelector = "querySelectorAll" in document;
    supports.svg = document.implementation && document.implementation.hasFeature && document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");

    if (supports.svg) {

    }


})(this, this.document);