var server = require('./libs/server.js'),
    app    = require('./libs/app.js');

app.start(__dirname);
server.init(app.getIO());