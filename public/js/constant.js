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
