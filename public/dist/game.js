(function (window) {  // start self executing function...

'use strict';

var CLASS    = {},
    CONST    = {},
    SINGLE   = {};

function $init(e) {
    window.removeEventListener('load', $init);
    
    $solveDependencies();

    var main = new CLASS.Main();
}
    
window.addEventListener('load', $init);

var $queueTable      = {}, // Keep track of the order in which classes extend each other.
    $childTable      = {}, // ...           which parent a child has.
    $dependencyTable = {}, // ...           which children a parent has.
    $dependencyStack = []; // Order in which classes should be extended.

/*
    Solve all dependencies before the Main class is called.
*/
function $solveDependencies() {
    $appendSuperClasses();  // Always set the prototype of top level classes first.
    $extendSuperClasses();
}

/*
    All top level classes that are not extended just grab all the
    properties from append and insert them into the prototype.
*/
function $appendSuperClasses() {
    var classes = Object.keys(CLASS);
    
    for (var i = 0, max = classes.length; i < max; i++) {
        var n = classes[i],  // Class name.
            c = CLASS[n];
        
        if (c.append && !$childTable[n]) {
            c.prototype = c.append; // Copy into the prototype.
            
            c.append = undefined;   // Just reference the prototype.
        } else {
            // If append was not declared, just point to a empty object.
            c.prototype = {};
        }
        
        c.prototype.constructor = c; // Set the constructor.
    }
}

/*
    Using the dependency stack, extend all super classes to their defined
    children.
*/
function $extendSuperClasses() {
    var stack = $dependencyStack;
    
    /*
        Traverse through all the parents and children in the
        dependency table.
    */
    for (var i = 0, iMax = stack.length; i < iMax; i++) {
        var parent   = stack[i],
            children = $dependencyTable[parent];
        
        for (var j = 0, jMax = children.length; j < jMax; j++) {
            var child = children[j];
            
            $linkPrototype(parent, child);
        }
    }
}

/*
    Link the parent's prototype to the child prototype.
    The append hash can override any methods the parent
    prototype has.
*/
function $linkPrototype(from, to) {
    var child  = CLASS[to],   // Child class.
        parent = CLASS[from]; // Parent class.
    
    /*
        Stop program if parent or child do not exist.
    */
    if (!parent || !child) {
        throw new Error(from + ' cannot link to ' + to + '.');
    }
    
    // Link to the parent's prototype.
    child.prototype = Object.create(parent.prototype);
    
    if (child.append) {
        var keys = Object.keys(child.append);
        
        // Copy all the properties in append into the prototype.
        for (var i = 0, max = keys.length; i < max; i++) {
            var property = keys[i];
            
            child.prototype[property] = child.append[property];
        }
    }

    child.prototype.constructor = child;
    
    child.append = undefined;
}

/*
    Fix the order in which classes are extended.
*/
function $swapParent(child) {
    var stack    = $dependencyStack,
        parent   = $childTable[child],      // The parent which the child references.
        newStack = new Array(stack.length); // New array that will replace the old stack.
    
    /*
        Swap the parent with the child. At a certain point the newStack will be 
        offset by one to copy all the remaining indexes in the old stack.
    */
    for (var i = 0, j = 0, max = stack.length; i < max; i++) {
        if (stack[i] === child) {
            newStack[j]   = parent;
            newStack[j++] = child;
        } else if (stack[i] !== parent) {
            newStack[j] = stack[i];
        }
        
        j++;
    }
    
    $dependencyStack = newStack; // Reference the new stack.
}

/*
    Keep reference of the parent and child class names to solve all
    the dependencies before the program starts.
*/
function extend(parent, child) {
    // If hash is undefined. Create a new array for that hash.
    if (!$dependencyTable[parent]) { $dependencyTable[parent] = []; }
    
    $dependencyTable[parent].push(child); // Keep track of new child in collection.
    
    // Do not allow child to inherit from more than one class.
    if ($childTable[child]) {
        throw new Error(child + ' cannot inherit more than once.');
    }
    
    // Push parent into stack if it has not been queued yet.
    if (!$queueTable[parent]) { 
        $dependencyStack.push(parent);
        $queueTable[parent] = true;
    }
    
    /*
        Has child been already added as a parent?
        Fix stack order if true.
    */
    if ($queueTable[child]) {
        $swapParent(child);       
    }
    
    $childTable[child] = parent; // Point to which parent the child is extending.
}

CLASS.Main = function () {
    // Initialize input.
    SINGLE.Keyboard.init();
    
    this.canvas  = document.getElementById('myCanvas'); // Grab the canvas from the DOM.
    this.context = this.canvas.getContext('2d');        // Get the rendering context.
    
    // Set the dimensions for the canvas.
    this.canvas.width  = CONST.STAGE_WIDTH;
    this.canvas.height = CONST.STAGE_HEIGHT;
    
    this.menu = new CLASS.Menu('menu'); // Game Menu
    
    this.user = null; // Type of user.
    
    // Socket.IO Callbacks
    SINGLE.Socket.on('connected',    this.onConnect.bind(this));
    SINGLE.Socket.on('disconnected', this.leaveGame.bind(this));
    
    SINGLE.Socket.on('joinGame',   this.joinGame.bind(this));
    SINGLE.Socket.on('createGame', this.createGame.bind(this));
};

CLASS.Main.append = {
    /*
        Run as soon as the client connects to server.
    */
    onConnect: function () {
        
    },
    
    /*
        join callback.
    */
    joinGame: function (data) {
        this.menu.hide();
        
        // Add border around canvas.
        this.canvas.setAttribute('class', 'addBorder');
        
        this.user = new CLASS.Player(this.context, data);
        
        // Start update loop.
        this.user.update();
    },
    
    /*
        init callback.
    */
    createGame: function (data) {
        this.menu.hide();
        
        // Add border around canvas.
        this.canvas.setAttribute('class', 'addBorder');
        
        this.user = new CLASS.Host(this.context, data);
        
        // Start update loop.
        this.user.update();
    },
    
    /*
        disconnected callback.
    */
    leaveGame: function () {
        if (!this.user) { return false; }
        
        // Delete user.
        this.user.destroy();
        this.user = null;
        
        // Remove border from canvas.
        this.canvas.setAttribute('class', '');
        
        this.menu.show();
    }
};

// Types of users.
CONST.HOST   = 'host';
CONST.PLAYER = 'player';

// Colors
CONST.WHITE = '#ffffff';
CONST.BLACK = '#000000';

// Keyboard Keys
CONST.W_KEY     = 87;
CONST.A_KEY     = 65;
CONST.D_KEY     = 68;
CONST.SPACE_KEY = 32;

// Size of in-game view.
CONST.STAGE_WIDTH  = 960;
CONST.STAGE_HEIGHT = 480;

CONST.MAX_BULLETS         = 100; // Amount of bullets we can spawn per player.
CONST.BULLET_RADIUS       = 2;   // Size of the bullet.
CONST.BULLET_LIFESPAN     = 120; // Duration in frames.
CONST.BULLET_MAX_VELOCITY = 5;   // Velocity cap.

CONST.SHIP_RADIUS       = 10;    // Size of ship.
CONST.SHIP_START_X      = 100;   // Spawn position X.
CONST.SHIP_START_Y      = 100;   // ...            Y.
CONST.SHIP_ROTATION     = 5;     // Rotation speed.
CONST.SHIP_COOLDOWN     = 5;     // Firing speed in frames.
CONST.SHIP_MAX_VELOCITY = 2;     
CONST.SHIP_ACCELERATION = 0.05;  // Ship's rate of acceleration.

// Sum used to determine spherical collision between ships and bullets.
CONST.BULLET_SHIP_RADIUS_SUM = CONST.BULLET_RADIUS + CONST.SHIP_RADIUS;

// Boundaries.
CONST.MIN_X = 0 - CONST.SHIP_RADIUS * 2;   
CONST.MIN_Y = 0 - CONST.SHIP_RADIUS * 2;
CONST.MAX_X = CONST.STAGE_WIDTH  + CONST.SHIP_RADIUS * 2;
CONST.MAX_Y = CONST.STAGE_HEIGHT + CONST.SHIP_RADIUS * 2;

CONST.RADIAN    = Math.PI / 180; // Cache number used to convert to radians.
CONST.END_ANGLE = Math.PI * 2;   // ...                  determine a complete circle.

CONST.FPS = 60; // Game run-speed.

CONST.TICK = CONST.FPS / 20; // Update player data @ server.

CONST.MAX_PLAYER_SIZE = 2;   // Maximum capacity of users per room in-game.

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

CLASS.Stage = function () {
    // Position
    this.x = 0;
    this.y = 0;
};

CLASS.Stage.append = {
    /*
        Clear everything that has been rendered.
    */
    clear: function (context) {
        context.clearRect(this.x, this.y, CONST.STAGE_WIDTH, CONST.STAGE_HEIGHT);
    }
};

CLASS.Element = function (id) {
    // Get DOM element.
    this.html = document.getElementById(id);
};

CLASS.Element.append = {
    /*
        Display html element.
    */
    show: function () {
        this.html.style.display = 'block';
    },
    
    /*
        Hide html element.
    */
    hide: function () {
        this.html.style.display = 'none';
    }
};
extend('Element', 'Button');

CLASS.Button = function (id, callback, listener) {
    CLASS['Element'].call(this, id);
    
    this.callback = callback; // onclick callback.
    this.listener = listener;
    
    // Set onclick callback.
    this.html.onclick = this.onClick.bind(this);
};

CLASS.Button.append = {
    onClick: function (e) {
        // Invoke listener's callback.
        this.listener[this.callback]();
    }
};

extend('Element', 'TextField');

CLASS.TextField = function (id) {
    CLASS['Element'].call(this, id);
};

CLASS.TextField.append = {
    /*
        Clear text field.
    */
    clear: function () {
        this.html.value = '';
    },
    
    /*
        Check if text field is empty.
    */
    isEmpty: function () {
        var value = this.html.value;
        
        if   (value = '' || value.length === 0) { return true;  } 
        else                                    { return false; }
    },
    
    /*
        Return string inside field.
    */
    getValue: function () {
        return this.html.value;
    }
};

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

extend('Element', 'MainMenu');

CLASS.MainMenu = function (id) {
    CLASS['Element'].call(this, id);
    
    // Buttons used for navigation between menus.
    this.joinBackButton   = new CLASS.Button('joinBack',   'showMainMenu', this);
    this.createBackButton = new CLASS.Button('createBack', 'showMainMenu', this);
    
    this.joinMenuButton   = new CLASS.Button('joinMenuButton',   'showJoinMenu',   this);
    this.createMenuButton = new CLASS.Button('createMenuButton', 'showCreateMenu', this);
    
    // in-game menus.
    this.joinMenu   = new CLASS.JoinMenu('joinMenu');
    this.createMenu = new CLASS.CreateMenu('createMenu');
};

CLASS.MainMenu.append = {
    /*
        Toggle between menus.  
    */
    showMainMenu: function () {
        this.show();
        this.joinMenu.hide();
        this.createMenu.hide();
    },
    
    showJoinMenu: function () {
        this.hide();
        this.joinMenu.show();
    },
    
    showCreateMenu: function () {
        this.hide();
        this.createMenu.show();
    }
};

extend('Element', 'Menu');

CLASS.Menu = function (id) {
    CLASS['Element'].call(this, id);
    
    // Game's Main Menu
    this.mainMenu = new CLASS.MainMenu('mainMenu');
};

CLASS.Menu.append = {
    // Override
    hide: function () {
        this.html.style.display = 'none';
        this.mainMenu.showMainMenu();
    }
};

SINGLE.Keyboard = {
    // Listeners
    keyUp:   {},
    keyDown: {},
    
    /*
        Listen to DOM keyboard events.
    */
    init: function () {
        // Set callbacks.
        document.onkeyup   = this.onKeyUp.bind(this);
        document.onkeydown = this.onKeyDown.bind(this);
    },
    
    /*
        Allow listener to hear event for key up with assigned key code.
    */
    getKeyUp: function (keyCode, listener) {
        if (!this.keyUp[keyCode]) { this.keyUp[keyCode] = []; }
        
        // Push listener to assigned keycode hash.
        this.keyUp[keyCode].push(listener);
    },
    
    /*
        Callback for onkeyup event.
    */ 
    onKeyUp: function (e) {
        var listeners = this.keyUp[e.keyCode];
        
        // If there are listeners listening for keycode, then traverse them calling onKeyUp.
        if (listeners) {    
            for (var i = 0, max = listeners.length; i < max; i++) {
                listeners[i].onKeyUp(e.keyCode);
            }
        }
    },
    
    /*
        Allow listener to hear event for key down with assigned key code.
    */
    getKeyDown: function (keyCode, listener) {
        if (!this.keyDown[keyCode]) { this.keyDown[keyCode] = []; }
        
        this.keyDown[keyCode].push(listener);
    },
    
    /*
        Callback for onkeydown event.
    */
    onKeyDown: function (e) {
        var listeners = this.keyDown[e.keyCode];
        
        if (listeners) {    
            for (var i = 0, max = listeners.length; i < max; i++) {
                listeners[i].onKeyDown(e.keyCode);
            }
        }
    }
};

/*
    Reference with a singleton the client's socket.
*/
SINGLE.Socket = io.connect(window.location.hostname);

extend('User', 'Host');

CLASS.Host = function (context, data) {
    CLASS['User'].call(this, context, data);
};

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

SINGLE.PlayerData =  {
    buffer: '',
    
    emit: function () {
        SINGLE.Socket.emit('updatePlayer', this.buffer);
    },
    
    encode: function (data) {
        var i   = 6,
            s   = data.ship,
            max = s.bullets.length * 4 + i,
            i16 = new Int16Array(max);
        
        i16[0] = data.id;
        
        i16[1] = s.x         * 10;
        i16[2] = s.y         * 10;
        i16[3] = s.rotation  * 10;
        i16[4] = s.velocityX * 10;
        i16[5] = s.velocityY * 10;
        
        var node = s.bullets.first;
        
        while (node) {
            var bullet = node.value;
            
            i16[i++] = bullet.x         * 10;
            i16[i++] = bullet.y         * 10;
            i16[i++] = bullet.velocityX * 10;
            i16[i++] = bullet.velocityY * 10;
            
            node = node.next;
        }
        
        var uI8 = new Uint8Array(i16.buffer);
        
        this.buffer = SINGLE.UTF8.encode(uI8);
    },
    
    decode: function (data) {
        var arr = new ArrayBuffer(data.length),
            uI8 = new Uint8Array(arr);
        
        for (var i = 0, dataLength = data.length; i < dataLength; i++) {
            uI8[i] = data.charCodeAt(i);
        }
        
        var i16 = new Int16Array(arr);
        
        this.buffer = Array.apply([], i16);
        
        for (var j = 1, bufferLength = this.buffer.length; j < bufferLength; j++) {
            this.buffer[j] = this.buffer[j] * 0.1;
        }
        
        var b = this.buffer;
        
        return {
            playerID: b[0],
            
            x:  b[1],
            y:  b[2],
            r:  b[3],
            vX: b[4],
            vY: b[5],
            
            bullets: b.slice(6, b.length)
        };
    }
};

SINGLE.UTF8 = {
    encode: function (data) {
        return String.fromCharCode.apply(String, [].slice.call(data, 0));
    },
    
    getSize: function (data) {
        var sizeInBytes = data.split('')
        .map(function(ch) {
            return ch.charCodeAt(0);
        }).map(function(uchar) {
            return uchar < 128 ? 1 : 2;
        }).reduce(function(curr, next) {
            return curr + next;
        });

        return sizeInBytes;
    }
};

CLASS.LinkedList = function () {
    this.first = null;
    this.last  = null;
    
    this.length = 0;
};

CLASS.LinkedList.append = {
    push: function (node) {
        if (this.length === 0) {
            this.first = node;
            this.last  = node;
        } else {
            this.last.next = node;
            
            node.prev = this.last;
            this.last = node;
        }
        
        this.length++;
    },
    
    pull: function (node) {
        var prev = node.prev,
            next = node.next;
        
        if (prev === false || next === false) {
            throw new Error('Node does not exist.');
        }
        
        if (prev && next) {
            prev.next = next;
            next.prev = prev;
            
        } else if (!prev && next) {
            this.first      = next;
            this.first.prev = null;
            
        } else if (prev && !next) {
            this.last      = prev;
            this.last.next = null;
            
        } else if (!prev && !next) {
            this.first = null;
            this.last  = null;
        }
        
        this.length--;
        
        node.next = false;
        node.prev = false;
        
        return next;
    }
};

CLASS.ListNode = function (value) {
    this.next  = null;
    this.prev  = null;
    this.value = value;
};

CLASS.BulletPool = function () {    
    this.pool = new CLASS.Pool(CLASS.Bullet, CONST.MAX_BULLETS);
};

CLASS.BulletPool.append = {    
    reset: function (bullet) {
        bullet.x         = 0;
        bullet.y         = 0;
        bullet.velocityX = 0;
        bullet.velocityY = 0;
        bullet.time      = 0;
        bullet.dead      = false;
    },
    
    push: function (node) {
        this.reset(node.value);
        this.pool.push(node);
    },
    
    pull: function () {
        return this.pool.pull();
    }
};

extend('LinkedList', 'Pool');

CLASS.Pool = function (Class, size) {
    CLASS['LinkedList'].call(this);
    
    for (var i = 0; i < size; i++) {
        this.push(new CLASS.ListNode(new Class()));
    }
};

CLASS.Pool.append = {
    // Override
    pull: function () {
        if (this.length === 0) {
            throw new Error('Pool has been exhausted.');
        }
        
        var node = null;
        
        if (this.length > 1) {
            node = this.last;
            
            this.last = this.last.prev;
        } else {
            node = this.first;
            
            this.first = null;
            this.last  = null;
        }
        
        this.length--;
        
        node.next = null;
        node.prev = null;
        
        return node;
    }
};

}(this));   // end self executing function...