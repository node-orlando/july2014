CLASS.Bullet = function () {
    // Position
    this.x = 0;
    this.y = 0;
    
    // Velocity
    this.velocityX = 0;
    this.velocityY = 0;
    
    // Time elapsed after being fired from ship.
    this.time = 0;
    
    // Can we destroy bullet?
    this.dead = false;
};

CLASS.Bullet.append = {
    /*
        Update bullet.
    */
    update: function () {
        // Update position.
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Increate time bullet has been alive by one every frame.
        this.time++;
        
        // If bullet has passed its lifespan destroy it.
        if (this.time >= CONST.BULLET_LIFESPAN) { this.dead = true; }
        
        // Check if bullet is out of bounds.
        this.checkBounds();
    },
    
    /*
        Render bullet.
    */
    draw: function (context) {
        context.strokeStyle = CONST.WHITE;
        
        // Draw Circle
        context.beginPath();
        context.arc(this.x, this.y, CONST.BULLET_RADIUS, 0, CONST.END_ANGLE, false);
        context.stroke();
        context.closePath();
    },
    
    /*
        Launch bullet in the direction the ship is pointing at.
    */
    launch: function (angle) {
        var a = (Math.PI * angle) / 180; // Angle
        
        this.velocityX = CONST.BULLET_MAX_VELOCITY * Math.cos(a);
        this.velocityY = CONST.BULLET_MAX_VELOCITY * Math.sin(a);
        
        // Round values to keep them consistent throughout all clients in-game.
        this.velocityX = Math.round(this.velocityX * 10) * 0.1;
        this.velocityY = Math.round(this.velocityY * 10) * 0.1;
    },
    
    /*
        As soon as bullet gets out of bounds, destroy it.
    */
    checkBounds: function () {
        if (this.x < CONST.MIN_X || this.x > CONST.MAX_X ||
            this.y < CONST.MIN_Y || this.y > CONST.MAX_Y) {
            this.dead = true;
        }
    }
};
