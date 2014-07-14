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
};

CLASS.Main.append = {
    /*
        As soon as the client connects to a room, initialize game.
    */
    onConnect: function () {
        SINGLE.Socket.on('joinGame',   this.joinGame.bind(this));
        SINGLE.Socket.on('createGame', this.createGame.bind(this));
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
