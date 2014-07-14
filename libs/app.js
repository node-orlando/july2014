var express = require('express');
var path    = require('path');
var app     = express();

//var logger = require('morgan');
//app.use(logger('dev'));
//
//var logfmt = require("logfmt");
//
//app.use(logfmt.requestLogger());

app.get('/', function (req, res) {
    res.render('index');
});

exports.start = function (root) {
    var debug = require('debug')('NodeWars');
    
    app.set('port', process.env.PORT || 3000);

    server = app.listen(app.get('port'), function() {
        debug('Express server listening on port ' + server.address().port);
    });
    
    io = require('socket.io').listen(server);
    
    setRoot(root);
};

function setRoot(root) {
    // Static Files
    app.use(express.static(path.join(root, 'public')));
    
    // Views
    app.set('views', path.join(root, '/views'));
    app.set('view engine', 'jade');
}
    
exports.getIO = function () {
    return io;
};