extend('Ship', 'PlayerShip');

CLASS.PlayerShip = function (x, y, name) {
    CLASS['Ship'].call(this, x, y, name);
    
    this.pool     = new CLASS.BulletPool(); // Object pool of bullets.
    this.bullets  = new CLASS.LinkedList(); // Collection of bullets that have been fired.
    
    // Keep track of when ship can shoot again.
    this.cooldown = 0;
    
    // Is any of these keys pressed down?
    this.wKey     = false;
    this.aKey     = false;
    this.dKey     = false;
    this.spaceKey = false;
    
    // Listen for key down event.
    SINGLE.Keyboard.getKeyDown(CONST.W_KEY,     this);
    SINGLE.Keyboard.getKeyDown(CONST.A_KEY,     this);
    SINGLE.Keyboard.getKeyDown(CONST.D_KEY,     this);
    SINGLE.Keyboard.getKeyDown(CONST.SPACE_KEY, this);
    
    // Listen for key up event.
    SINGLE.Keyboard.getKeyUp(CONST.W_KEY,     this);
    SINGLE.Keyboard.getKeyUp(CONST.A_KEY,     this);
    SINGLE.Keyboard.getKeyUp(CONST.D_KEY,     this);
    SINGLE.Keyboard.getKeyUp(CONST.SPACE_KEY, this);
};

CLASS.PlayerShip.append = {
    update: function () {        
        // Change position based on velocity.
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Round values to keep them consistent throughout all clients in-game.
        this.x = Math.round(this.x * 10) * 0.1;
        this.y = Math.round(this.y * 10) * 0.1;
        
        // Reduce cooldown to zero.
        if (this.cooldown > 0) { this.cooldown--; }
        
        // If any of this keys are pressed down execute defined function for key.
        if (this.wKey)     { this.accelerate();             }
        if (this.aKey)     { this.rotateCounterClockWise(); }
        if (this.dKey)     { this.rotateClockWise();        }
        if (this.spaceKey) { this.fireBullet();             }
        
        this.updateBullets();
        
        // Check if ship is out of bounds.
        this.checkBounds();
    },
    
    /*
        Traverse bullets list & update all of them.
    */
    updateBullets: function () {
        var node = this.bullets.first;
        
        while (node) {
            var bullet = node.value;
            
            // If bullet is dead discard it from the list and send it back to the pool.
            if (bullet.dead) {
                this.bullets.pull(node);
                this.pool.push(node);
            } else {
                bullet.update();
                
                node = node.next;
            }
        }
    },
    
    /*
        Render all fired bullets.
    */
    drawBullets: function (context) {
        var node = this.bullets.first;
        
        while (node) {
            var bullet = node.value;
            
            bullet.draw(context);
            
            node = node.next;
        }
    },
    
    fireBullet: function () {
        // Do not fire if cooldown has not finished.
        if (this.cooldown > 0) { return false; }
        
        var node   = this.pool.pull(),
            bullet = node.value;
        
        // Initialize bullet's position @ ship's position.
        bullet.x = this.x;
        bullet.y = this.y;
        bullet.launch(this.rotation);
        
        // Add to list.
        this.bullets.push(node);
        
        // Restart cooldown.
        this.cooldown = CONST.SHIP_COOLDOWN;
    },
    
    /*
        Check if any of the bullets this ship has fired collide with the target ship.
    */
    checkHit: function (ship) {
        var node = this.bullets.first;
        
        while (node) {
            var bullet = node.value,
                dX     = bullet.x - ship.x, // Delta X
                dY     = bullet.y - ship.y, // Delta Y
                d      = Math.sqrt(dX * dX + dY * dY); // Distance Formula
            
            // Destroy bullet if it collides with ship.
            if (d < CONST.BULLET_SHIP_RADIUS_SUM) { bullet.dead = true; }
            
            node = node.next;
        }
    },
    
    /*
        Set any key that is not pressed down anymore to false.
    */
    onKeyUp: function (keyCode) {
        switch (keyCode) {
            case CONST.W_KEY:        this.wKey     = false;      break;
            case CONST.A_KEY:        this.aKey     = false;      break;
            case CONST.D_KEY:        this.dKey     = false;      break;
            case CONST.SPACE_KEY:    this.spaceKey = false;      break;
        }
    },
    
    /*
        Set any key that has been pressed down to true.
    */
    onKeyDown: function (keyCode) {
        switch (keyCode) {
            case CONST.W_KEY:        this.wKey     = true;       break;
            case CONST.A_KEY:        this.aKey     = true;       break;
            case CONST.D_KEY:        this.dKey     = true;       break;
            case CONST.SPACE_KEY:    this.spaceKey = true;       break;
        }
    }
};
