extend('User', 'Host');

CLASS.Host = function (context, data) {
    CLASS['User'].call(this, context, data);
};
