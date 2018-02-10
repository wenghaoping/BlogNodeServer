/**
 * Created by Admin on 2017/10/24.
 */
/*
 封装socket.io,为了获取server以便监听.
 */
var socketio = {};
var socket_io = require('socket.io');

//获取io
socketio.getSocketio = function(server){

    var io = socket_io.listen(server);

};

module.exports = socketio;