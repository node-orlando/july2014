extend('Element', 'RoomList');

CLASS.RoomList = function (id) {
    CLASS['Element'].call(this, id);
    
    this.selectedID = null;  // Currently selected room ID.
    this.selectedRow = null; // ...                <li> element.
    
    // Set onclick callback.
    this.html.onclick = this.onClick.bind(this);
};

CLASS.RoomList.append = {
    /*
        Clear all rows in list.
    */
    clear: function () {
        this.html.innerHTML = '';
    },
    
    /*
        Populate list with the data we get from the server.
    */
    populate: function (data) {        
        var rooms = data.rooms;
        
        for (var i = 0, max = rooms.length; i < max; i++) {
            var r     = rooms[i],
                li    = document.createElement('li'),
                host  = document.createElement('span'),
                count = document.createElement('span');
            
            // Set unique room ID.
            li.setAttribute('id', r.roomID);
            
            // Set styling properties.
            host.setAttribute('class', 'host');
            count.setAttribute('class', 'count');
            
            // Set text data.
            host.innerHTML  = r.host;
            count.innerHTML = r.count + ' / ' + CONST.MAX_PLAYER_SIZE;
            
            // Append to DOM.
            this.html.appendChild(li);
            
            li.appendChild(host);
            li.appendChild(count);
        }
    },
    
    /*
        onclick event callback.
    */
    onClick: function (e) {
        var t = e.target;
        
        if (t.nodeName === 'SPAN') {
            // Select parent <li> element.
            t = t.parentElement;
            
            // Grab Room ID of selected row.
            this.selectedID = t.getAttribute('id');
        }
        
        // If a previous row had been selected, remove highlight.
        if (this.selectedRow) { this.selectedRow.setAttribute('class', ''); }
        
        // Set & hightlight selected row.
        this.selectedRow = t;
        this.selectedRow.setAttribute('class', 'selected');
    }
};
