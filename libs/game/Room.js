var Room = function (id, host) {
    this.id      = id;
    this.host    = host;
    this.full    = false;
    this.count   = 0;
    this.players = {};
};

Room.prototype = {
    addPlayer: function (player) {
        if (this.full) { return false; }
        
        this.players[player.id] = player;
        
        this.count++;
        
        if (this.count === 2) { this.full = true; }
    },
    
    removePlayer: function (id) {
        if (this.count <= 0) { return false; }
        
        delete this.players[id];
        
        this.count--;
        
        this.full = false;
    }
};

module.exports = Room;