// Simple globally unique identifier.
var GUID = 1;

// SocketIO
var io = null;

// Keep track of existing rooms.
var rooms  = {};

var Room   = require('./game/Room.js'),
    Player = require('./game/Player.js');

exports.init = function (socketIO) {
    io = socketIO;
        
    io.sockets.on('connection', function (socket) {
        connect(socket);
    });
};

/*
    Upon succesful connection, add event listeners to the socket that
    just connected.
*/
function connect(socket) {
    socket.on('disconnect', disconnect);
    
    socket.on('joinRoom',         joinRoom);
    socket.on('createRoom',       createRoom);
    socket.on('getJoinableRooms', getJoinableRooms);
    
    socket.on('newPlayer',    newPlayer);
    socket.on('updatePlayer', updatePlayer);
    
    // Emit a message letting the client know he connected.
    socket.emit('connected');
}

function disconnect() {
    var room = rooms[this.roomID];
    
    if (!room) { return false; }
    
    var player = room.players[this.playerID];
    
    if (!player) { return false; }
    
    // If player is host, disconnect all players in room.
    if (player.user === 'host') {
        io.sockets.in(this.roomID).emit('disconnected');
        
        // Remove reference from room.
        rooms[this.roomID] = undefined;
        
    // Otherwise just disconnect player.
    } else {
        // Allow other players in room to know player left.
        this.broadcast.to(this.roomID).emit('playerLeft');
        room.removePlayer(player.id);
        this.emit('disconnected');
    }
    
    // Eliminate references in socket for room & player ID.
    this.roomID   = null;
    this.playerID = null;
}

function joinRoom(data) {
    var room   = rooms[data.roomID],
        player = new Player(GUID++, data.name, 'player');
    
    room.addPlayer(player);
    
    this.join(room.id);
    
    // Allow socket to reference room & player ID.
    this.roomID   = room.id;
    this.playerID = player.id;
    
    // Initialize game as player.
    this.emit('joinGame', {
        user:     player.user,
        name:     player.name,
        players:  room.players,
        playerID: player.id
    });
}

function createRoom(data) {
    var room   = new Room(GUID++, data.name),
        player = new Player(GUID++, data.name, 'host');
    
    room.addPlayer(player);
    
    rooms[room.id] = room;
    
    this.join(room.id);
    
    this.roomID   = room.id;
    this.playerID = player.id;
    
    // Initialize game as host.
    this.emit('createGame', {
        user:     'host',
        name:     player.name,
        playerID: player.id
    });
}

function getJoinableRooms() {
    var joinableRooms = [];
    
    // Grab rooms that are not full.
    for (id in rooms) {
        var room = rooms[id];
        
        if (room && !room.full) {
            joinableRooms.push({
                host:   room.host,
                count:  room.count,
                roomID: room.id
            });
        }
    }
    
    this.emit('joinableRooms', {
        rooms: joinableRooms
    });
}

/*
    As soon as new player successfully joins the room, let other
    players in the room know.
*/
function newPlayer(data) {
    this.broadcast.to(this.roomID).emit('playerJoin', data);
}

/*
    Give to all other players in the room the latest state of player.
*/
function updatePlayer(data) {
    if (!rooms[this.roomID]) { return false; }
    
    rooms[this.roomID].players[this.playerID].state = data;
    
    this.broadcast.to(this.roomID).emit('playerUpdate', data);
}