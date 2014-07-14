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
