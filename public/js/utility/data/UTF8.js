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
