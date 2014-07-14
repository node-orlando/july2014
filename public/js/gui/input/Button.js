extend('Element', 'Button');

CLASS.Button = function (id, callback, listener) {
    CLASS['Element'].call(this, id);
    
    this.callback = callback; // onclick callback.
    this.listener = listener;
    
    // Set onclick callback.
    this.html.onclick = this.onClick.bind(this);
};

CLASS.Button.append = {
    onClick: function (e) {
        // Invoke listener's callback.
        this.listener[this.callback]();
    }
};
