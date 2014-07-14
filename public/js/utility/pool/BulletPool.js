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
