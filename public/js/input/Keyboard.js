SINGLE.Keyboard = {
    // Listeners
    keyUp:   {},
    keyDown: {},
    
    /*
        Listen to DOM keyboard events.
    */
    init: function () {
        // Set callbacks.
        document.onkeyup   = this.onKeyUp.bind(this);
        document.onkeydown = this.onKeyDown.bind(this);
    },
    
    /*
        Allow listener to hear event for key up with assigned key code.
    */
    getKeyUp: function (keyCode, listener) {
        if (!this.keyUp[keyCode]) { this.keyUp[keyCode] = []; }
        
        // Push listener to assigned keycode hash.
        this.keyUp[keyCode].push(listener);
    },
    
    /*
        Callback for onkeyup event.
    */ 
    onKeyUp: function (e) {
        var listeners = this.keyUp[e.keyCode];
        
        // If there are listeners listening for keycode, then traverse them calling onKeyUp.
        if (listeners) {    
            for (var i = 0, max = listeners.length; i < max; i++) {
                listeners[i].onKeyUp(e.keyCode);
            }
        }
    },
    
    /*
        Allow listener to hear event for key down with assigned key code.
    */
    getKeyDown: function (keyCode, listener) {
        if (!this.keyDown[keyCode]) { this.keyDown[keyCode] = []; }
        
        this.keyDown[keyCode].push(listener);
    },
    
    /*
        Callback for onkeydown event.
    */
    onKeyDown: function (e) {
        var listeners = this.keyDown[e.keyCode];
        
        if (listeners) {    
            for (var i = 0, max = listeners.length; i < max; i++) {
                listeners[i].onKeyDown(e.keyCode);
            }
        }
    }
};
