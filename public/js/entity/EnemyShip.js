extend('Ship', 'EnemyShip');

CLASS.EnemyShip = function (data) {
    CLASS['Ship'].call(this, data.x, data.y, data.name);
    
    this.rotation  = data.r;
    
    // Is ship close to boundaries?
    this.closeToEdge = false;
    
    // Newest state of ship's properties.
    this.newState = data;
};

CLASS.EnemyShip.append = {
    /*
        Set the newest state of ship.
    */
    update: function (data) {
        this.newState = data;
    },
    
    /*
        Transition to newest state as smoothly as possible.
    */
    interpolate: function (lambda) {
        this.checkBounds();
        
        // Check if ship is close to any boundary.
        this.closeToEdge = this.checkPosition();
        
        this.interpolateShip(lambda);
        this.interpolateBullets();
    },
    
    /*
        Interpolate ship with the newest state.
    */
    interpolateShip: function (lambda) {
        var s = this.newState;
        
        // If close to edge just update with current velocity.
        if (this.closeToEdge) {
            this.x += s.vX;
            this.y += s.vY;
            
        // If not close to edge then interpolate to newest position.
        } else {
            this.x = this.x + (lambda * (s.x - this.x));
            this.y = this.y + (lambda * (s.y - this.y));
        }
        
        if      (s.r > this.rotation) { this.rotateClockWise();        } 
        else if (s.r < this.rotation) { this.rotateCounterClockWise(); }
    },
    
    /*
        Interpolate bullets with the newest state.
    */
    interpolateBullets: function () {
        var bullets = this.newState.bullets;
        
        for (var i = 0, max = bullets.length; i < max; i = i + 4) {
            if (bullets[i] !== false) {
                // Grab velocity indexes.
                var vX = bullets[i + 2],
                    vY = bullets[i + 3];
                
                // Set position indexes.
                bullets[i + 0] += vX;
                bullets[i + 1] += vY;
            }
        }
    },
    
    /*
        Render all the bullets this ship has fired.
    */
    drawBullets: function (context) {
        var bullets = this.newState.bullets;

        context.strokeStyle = CONST.WHITE;
        
        for (var i = 0, max = bullets.length; i < max; i = i + 4) {
            if (bullets[i] !== false) {
                // Grab position indexes.
                var x  = bullets[i + 0],
                    y  = bullets[i + 1];
                
                // Draw circle.
                context.beginPath();
                context.arc(x, y, CONST.BULLET_RADIUS, 0, CONST.END_ANGLE, false);
                context.stroke();
                context.closePath();
            }
        }
    },
    
    checkHit: function (ship) {
        var bullets = this.newState.bullets;
        
        for (var i = 0, max = bullets.length; i < max; i = i + 4) {
            if (bullets[i] !== false) {
                var dX = bullets[i + 0] - ship.x,      // Delta X
                    dY = bullets[i + 1] - ship.y,      // Delta Y
                    d  = Math.sqrt(dX * dX + dY * dY); // Distance formula.
                
                // Set bullet indexes to false if it collides with another ship.
                if (d < CONST.BULLET_SHIP_RADIUS_SUM) {
                    bullets[i + 0] = false;
                    bullets[i + 1] = false;
                    bullets[i + 2] = false;
                    bullets[i + 3] = false;
                }
            }
        }
    },
    
    /*
        Return boolean if ship is approximating boundaries.
    */
    checkPosition: function () {
        if (this.x < 0 || this.x > CONST.STAGE_WIDTH ||
            this.y < 0 || this.y > CONST.STAGE_HEIGHT) {
            return true;   
        } else {
            return false;
        }
    }
};
