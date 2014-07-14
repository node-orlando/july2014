extend('User', 'Player');

CLASS.Player = function (context, data) {
    CLASS['User'].call(this, context, data);
    
    var s = this.ship;
    
    // Emit to server data about the player that just joined the room.
    SINGLE.Socket.emit('newPlayer', {
        x:  s.x,
        y:  s.y,
        r:  s.rotation,
        vX: s.velocityX,
        vY: s.velocityY,
        
        bullets: s.bullets,
        
        name:     s.name,
        playerID: this.id
    });
    
    // Add as enemies players with different IDs.
    for (var id in data.players) {
        if (id != this.id) { this.addEnemy(data.players[id]); }
    }
};
