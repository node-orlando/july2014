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
