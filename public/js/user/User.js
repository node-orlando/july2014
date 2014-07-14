CLASS.User = function (context, data) {
    // Unique player id.
    this.id = data.playerID;
    
    this.ship    = new CLASS.PlayerShip(CONST.SHIP_START_X, CONST.SHIP_START_Y, data.name);
    this.stage   = new CLASS.Stage(0, 0);
    
    // We start with no enemies until we get notified by the server.
    this.enemy   = null;
    
    this.context = context;
    
    this.frame  = 0; // Helps by updating player data in server at defined intervals.
    this.lambda = 0; // ...      interpolate enemy ship.
    
    this.loop = true;
    
    SINGLE.Socket.on('playerJoin',   this.addEnemy.bind(this));
    SINGLE.Socket.on('playerLeft',   this.removeEnemy.bind(this));
    SINGLE.Socket.on('playerUpdate', this.updateEnemy.bind(this));
};

CLASS.User.append = {
    update: function () {
        // If false halt update loop.
        if (!this.loop) { return false; }
        
        this.stage.clear(this.context);
        
        this.ship.update();
        this.ship.draw(this.context);
        this.ship.drawBullets(this.context);
        
        // Update enemy if he exists.
        if (this.enemy) {
            this.enemy.interpolate(this.lambda);
            this.enemy.draw(this.context);
            this.enemy.drawBullets(this.context);
            
            this.ship.checkHit(this.enemy);
            this.enemy.checkHit(this.ship);
        }
        
        // As soon as frame is bigger than TICK, update player data in server.
        if (this.frame < CONST.TICK) {
            SINGLE.PlayerData.encode(this);
            SINGLE.PlayerData.emit();
            
            // Reset
            this.frame  = 0;
            this.lambda = 0;
        }
        
        // Calculate lambda based on frame.
        this.lambda = (++this.frame / CONST.TICK);
        
        window.requestAnimationFrame(this.update.bind(this));
    },
    
    /*
        playerJoin callback.
    */
    addEnemy: function (data) {
        // Decode player data if the state property exists.
        if (data.state) {
            var decode = SINGLE.PlayerData.decode(data.state);
            
            // Enhance decoded data with name property.
            decode.name = data.name;
            
            data = decode;
        }
        
        this.enemy = new CLASS.EnemyShip(data);
    },
    
    /*
        playerLeft callback.
    */
    removeEnemy: function () {
        this.enemy = null; // Just set enemy to null.
    },
    
    /*
        playerUpdate callback.
    */
    updateEnemy: function (data) {
        var json = SINGLE.PlayerData.decode(data);
        
        this.enemy.update(json);
    },
    
    /*
        Destroy object.
    */
    destroy: function () {
        // Stop update loop.
        this.loop = false;
        
        // Clear anything that is left on the stage.
        this.stage.clear(this.context);
        
        // Delete references.
        delete this.ship;
        delete this.stage;
        delete this.context;
        
        // Remove listeners from client socket.
        SINGLE.Socket.removeListener('playerJoin',   this.addEnemy.bind(this));
        SINGLE.Socket.removeListener('playerLeft',   this.removeEnemy.bind(this));
        SINGLE.Socket.removeListener('playerUpdate', this.updateEnemy.bind(this));
    }
};
