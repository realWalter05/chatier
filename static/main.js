$(document).ready(function() {
console.log("Jquery works...");

$("#connect-btn").on("click", function () {
    const socket = io.connect("https://chatier.herokuapp.com/",
    {
        'transports': ['polling'],
        'autoConnect': true,
        'pingInterval': 25000,
        'pingTimeout': 180000,
        'reconnection': true,
        'reconnectionDelay': 1000,
        'reconnectionDelayMax': 5000,
        'reconnectionAttempts': 5,
		'secure': true
    });

    socket.on("connect", function () {
        let username = $("#username-input").val();
        socket.send(["set_username", username]);
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
                let sender = msg[0];
                let message = msg[1];
                let time = msg[2];

                if (document.querySelectorAll("#"+sender).length == 0) {
                    // Create conversation div
                    let conversationDiv = document.createElement("section");
                    conversationDiv.setAttribute("id", sender);
                    conversationDiv.setAttribute("class", "w-100 p-5 bg-light overflow-auto");
                    
                    let title = document.createElement("h3");
                    title.innerText = sender;
                    conversationDiv.append(title);
                    $("#result").append(conversationDiv);
                }

                $("#"+sender).append(time + " " + sender + ": " + message + "<br/>");
            }
        }   
    });		
    
    $("#send-msg-btn").on("click", function () {
        let msg = [$("#receiver-input").val(), $("#msg-input").val()];
        console.log(msg);
        socket.send(["message", msg]);

        if (document.querySelectorAll("#"+msg[0]).length == 0) {
            // Create conversation div
            let conversationDiv = document.createElement("section");
            conversationDiv.setAttribute("id", msg[0]);
            conversationDiv.setAttribute("class", "w-100 p-5 bg-light overflow-auto");
            
            let title = document.createElement("h3");
            title.innerText = msg[0];
            conversationDiv.append(title);
            $("#result").append(conversationDiv);
        }

        let hour = new Date().getHours();
        let minute = new Date().getMinutes();
        let second = new Date().getSeconds();
        let time = hour + ":" + minute + ":" + second;
        $("#"+msg[0]).append(time + " " + $("#username-input").val() + ": " + msg[1] + "<br/>");        
    });
});

});