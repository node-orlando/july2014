extend('Element', 'CreateMenu');

CLASS.CreateMenu = function (id) {
    CLASS['Element'].call(this, id);
    
    // Host's name.
    this.nameField = new CLASS.TextField('createField');
    
    this.createButton = new CLASS.Button('create', 'createRoom', this);
};

CLASS.CreateMenu.append = {
    createRoom: function () {
        if (this.nameField.isEmpty()) {
            alert('Please enter a name.');
            return false;
        }
        
        // Tell server to create room with given host name.
        SINGLE.Socket.emit('createRoom', {
            name: this.nameField.getValue()
        });
    }
};
