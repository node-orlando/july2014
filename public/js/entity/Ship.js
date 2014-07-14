/*
    Abstract Class:
    
    Meant to be extended by all ships.
*/

CLASS.Ship = function (x, y, name) {
    // Position
    this.x = x;
    this.y = y;
    
    // Angle the ship is pointing at.
    this.rotation = 0;
    
    // Velocity
    this.velocityX  = 0;
    this.velocityY  = 0;
    
    // Direction
    this.directionX = 0;
    this.directionY = 0;
    
    // Name of player.
    this.name = name;
};

CLASS.Ship.append = {
    /*
        Render ship.
    */
    draw: function (context) {
        var x = this.x,
            y = this.y,
            s = CONST.SHIP_RADIUS,             // Ship's size.
            a = this.rotation * CONST.RADIAN;  // Angle
        
        context.fillStyle   = CONST.WHITE;
        context.strokeStyle = CONST.WHITE;
        
        // Save current state of the context so we can render the ship based on its rotation.
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0); // Identity Matrix
        
        context.translate(x, y);
        context.rotate(a);
        
        context.beginPath();
        
        // Outline ship.
        context.moveTo(0 + s, 0    );
        context.lineTo(0 - s, 0 + s);
        context.lineTo(0    , 0    );
        context.moveTo(0 + s, 0    );
        context.lineTo(0 - s, 0 - s);
        context.lineTo(0    , 0    );
        
        context.stroke();
        context.closePath();
        
        // Restore saved state.
        context.restore();
        
        // Render name of player on top ship.
        var m = context.measureText(this.name).width;
        
        x = x - m * 0.5;
        y = y - s * 2;
        
        context.fillText(this.name, x, y);
    },
    
    accelerate: function () {
        var a = this.rotation * CONST.RADIAN; // Angle
        
        // Use trigonometric functions to find 2D velocity based on direction.
        this.directionX = Math.cos(a);
        this.directionY = Math.sin(a);
        
        // Add more velocity based on rate of acceleration.
        var vX = this.velocityX + CONST.SHIP_ACCELERATION * this.directionX,
            vY = this.velocityY + CONST.SHIP_ACCELERATION * this.directionY,
            v  = Math.sqrt((vX * vX) + (vY * vY)); // Determine total velocity using distance formula.
        
        // If current velocity is greater than max velocity, do not increase it.
        if (v < CONST.SHIP_MAX_VELOCITY) {
            this.velocityX = vX;
            this.velocityY = vY;
        }
    },
    
    rotateClockWise: function () {
        this.rotation += CONST.SHIP_ROTATION;
    },
    
    rotateCounterClockWise: function () {
        this.rotation -= CONST.SHIP_ROTATION;
    },
    
    /*
        As soon as ship leaves boundaries make it appear at the other side.
    */
    checkBounds: function () {
        if      (this.x < CONST.MIN_X) { this.x = CONST.MAX_X; } 
        else if (this.x > CONST.MAX_X) { this.x = CONST.MIN_X; }
        
        if      (this.y < CONST.MIN_Y) { this.y = CONST.MAX_Y; } 
        else if (this.y > CONST.MAX_Y) { this.y = CONST.MIN_Y; }
    }
};
