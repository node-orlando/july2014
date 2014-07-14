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
