
var chats = {}
$(document).ready(function() {
    // When user opens the page
    console.log("Jquery works...?");

    $("#register-btn").on("focus", function () {
        // Selecting username
        if ($("#register-btn").text() == "Connect") {
            $("#register-btn").text("Write your username!");    
        }

        $("#register-btn").on("keydown", function (e) {
            // Handling no letter keys
            if (e.key == "Backspace") {
                $("#register-btn").text($("#register-btn").text().slice(0, -1)); 
            } else if (e.key == "Enter") {
                $("#register-btn").blur();
            }                    
        });

        $("#register-btn").on("keypress", function (e) {
            // Handling text keypresses
            if ($("#register-btn").text() == "Write your username!" || $("#register-btn").text() == "Username taken!" ) {
                $("#register-btn").text("");
            }
            $("#register-btn").append(e.key); 
        });
    });
    
    $("#register-btn").on("focusout", function () {
        // User selected username
        $("#register-btn").off("keydown");
        $("#register-btn").off("keypress");

        // Connecting to chat
        const socket = io.connect("/");
        let username = $("#register-btn").text();
        socket.emit("client_registration", username)

        socket.on("username_taken", function () {
            // Username was taken
            socket.disconnect()
            $("#register-btn").text("Username taken!");
            $("#register-btn").focus();
        });


        socket.on("message", function (msg) {
            console.log(chats);
            // Message received
            let sender = msg["sender"]
            let content = msg["content"]
            let msg_dict = {"receiver-li" : msg["content"]}

            if (!(sender in chats)) {
                // Chat with this msg sender doesn't exist yet, so we create it
                chats[sender] = []                
                $(`
                    <a onclick="ChangeChat(this);" class="list-group-item list-group-item-action w-100 px-4 py-4" aria-current="true">
                        <div class="d-flex align-items-center justify-content-between">
                            <strong class="mb-1">` + sender + `</strong><small class="text-success">New message</small>
                        </div>
                        <div class="col mb-1 small">
                            ` + content + `
                        </div>
                    </a>`).insertBefore('#new-msg-btn');
            }

            // Adding a new message
            chats[sender].push(msg_dict)
            
            if ($("#selected-chat").find("strong").text() == sender) {
                // New message arrived from sender we have open chat with
                $('<li/>',{
                    text: msg["content"],
                    class: "receiver-li",
                }).appendTo('#msg-space');
            }
            // Updating chat options
            let newMessageDiv = $("strong:contains('" + sender + "')").parent().parent();
            $(newMessageDiv).find("small").text("New message").addClass("text-success");
            $(newMessageDiv).children().last().text(content);
        });
        
        $("#send-msg-btn").on("click", function () {
            // Sending a message
            let receiver = $("#selected-chat").find("strong").text();
            let content = $("#msg-input").val();
            let msg = {
                "receiver" : receiver,
                "content" : content,
            }
            let msg_dict = {"sender-li" : content};
            chats[receiver].push(msg_dict)
            $('<li/>',{
                text: content,
                class: "sender-li",
            }).appendTo('#msg-space');
            $('#msg-space').scrollTop($('#msg-space').get(0).scrollHeight);
            socket.send(msg);

            // Reset msg input
            $("#msg-input").val("");
        });
    });

    $("#new-msg-btn").on("focus", function () {
        // Creating a new chat
        $("#new-msg-btn").text("To whom?")

        $("#new-msg-btn").on("keydown", function (e) {
            // Handling no letter keys
            if (e.key == "Backspace") {
                $("#new-msg-btn").text($("#new-msg-btn").text().slice(0, -1)); 
            } else if (e.key == "Enter") {
                $("#new-msg-btn").blur();
            }                    
        });

        $("#new-msg-btn").on("keypress", function (e) {
            // Handling text keypresses
            if ($("#new-msg-btn").text() == "New message" || $("#new-msg-btn").text() == "To whom?") {
                $("#new-msg-btn").text("");
            }
            $("#new-msg-btn").append(e.key); 
        });      
    });

    $("#new-msg-btn").on("focusout", function () {
        // User selected chat receiver
        $("#new-msg-btn").off("keydown");
        $("#new-msg-btn").off("keypress");
        let sender = $("#new-msg-btn").text() 
        chats[sender] = []

        $(`
        <a onclick="ChangeChat(this);" class="list-group-item list-group-item-action w-100 px-4 py-4" aria-current="true">
            <div class="d-flex align-items-center justify-content-between">
                <strong class="mb-1">` + sender + `</strong><small>No messages</small>
            </div>
            <div class="col mb-1 small">
                Write him something :)
            </div>
        </a>`).insertBefore('#new-msg-btn').click();
        $("#new-msg-btn").text("New message")
    });

    $("#msg-input").on("keypress", function (e) {
        if ((e.keyCode || e.which) == 13) {
            $("#send-msg-btn").click();
            return false;
          }        
    });
});

function ChangeChat(selectedChat) {
    // Changing chats
    $("#msg-space").empty();
    $("#selected-chat").removeAttr('id');
    $(selectedChat).attr("id", "selected-chat");

    let sender = $(selectedChat).find("strong").text();
    
    $.each(chats[sender], function(index, chatDict) {
        for (let key in chatDict) {
            $('<li/>',{
                text: chatDict[key],
                class: key,
            }).appendTo('#msg-space');
        }
    });
}