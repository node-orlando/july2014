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
