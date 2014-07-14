extend('Element', 'JoinMenu');

CLASS.JoinMenu = function (id) {
    CLASS['Element'].call(this, id);
    
    // List containing available rooms for player to join.
    this.roomList = new CLASS.RoomList('joinList');
    
    // Player's name.
    this.nameField = new CLASS.TextField('joinField');
    
    this.joinButton    = new CLASS.Button('join', 'joinRoom', this);
    this.refreshButton = new CLASS.Button('refresh', 'refreshList', this);
    
    SINGLE.Socket.on('joinableRooms', this.roomList.populate.bind(this.roomList));
};

CLASS.JoinMenu.append = {
    joinRoom: function () {
        if (this.nameField.isEmpty()) {
            alert('Please enter a name.');
            return false;
        }
        
        var roomID = this.roomList.selectedID;
        
        if (!roomID) {
            alert(' Please select a room.');
            return false;
        }
        
        // Join selected room in server.
        SINGLE.Socket.emit('joinRoom', {
            name:   this.nameField.getValue(),
            roomID: roomID
        });
    },
    
    /*
        Refresh room list.
    */
    refreshList: function () {
        this.roomList.clear();
        
        // Request server for available rooms.
        SINGLE.Socket.emit('getJoinableRooms');
    },
    
    // Override
    show: function () {
        this.html.style.display = 'block';
        SINGLE.Socket.emit('getJoinableRooms');
    },
    
    hide: function () {
        this.html.style.display = 'none';
        this.roomList.clear();
    }
};
