extend('Element', 'TextField');

CLASS.TextField = function (id) {
    CLASS['Element'].call(this, id);
};

CLASS.TextField.append = {
    /*
        Clear text field.
    */
    clear: function () {
        this.html.value = '';
    },
    
    /*
        Check if text field is empty.
    */
    isEmpty: function () {
        var value = this.html.value;
        
        if   (value = '' || value.length === 0) { return true;  } 
        else                                    { return false; }
    },
    
    /*
        Return string inside field.
    */
    getValue: function () {
        return this.html.value;
    }
};
