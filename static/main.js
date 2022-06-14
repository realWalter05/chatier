$(document).ready(function() {
console.log("We started.");

$("#connect-btn").on("click", function () {
    const socket = io.connect('http://' + document.domain + ':' + location.port);

    socket.on("connect", function () {
        let username = $("#username-input").val()
        socket.send(username);
        //socket.send("usernames_request");
    });

    socket.on("message", function (msg) {
        if (Array.isArray(msg)) {
            if (msg[0] == "usernames") {
                $("#online").append("<li>" + msg[1] + "</li>");
            } else if (msg[0] == "usernames_full") {
                for(let i = 0; i < msg[1].length; i++) {
                    $("#online").append("<li>" + msg[1][i] + "</li>");
                }
            } else {
                $("#result").append(msg[0] + ": " + msg[1] + "<br/>");
            }
        }   
    });		
    
    $("#send-msg-btn").on("click", function () {
        let msg = [$("#receiver-input").val(), $("#msg-input").val()];
        console.log(msg);
        socket.send(msg);
    });
});

});