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
