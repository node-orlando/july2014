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
