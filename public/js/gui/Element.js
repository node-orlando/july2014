CLASS.Element = function (id) {
    // Get DOM element.
    this.html = document.getElementById(id);
};

CLASS.Element.append = {
    /*
        Display html element.
    */
    show: function () {
        this.html.style.display = 'block';
    },
    
    /*
        Hide html element.
    */
    hide: function () {
        this.html.style.display = 'none';
    }
};