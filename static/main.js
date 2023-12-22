document.addEventListener('DOMContentLoaded', function () {
    var socket = io.connect('http://' + document.domain + ':' + location.port);

    // Retrieve user's name from local storage
    var userName = localStorage.getItem('userName');

    // If user's name is not in local storage, prompt for it
    if (!userName) {
        userName = prompt("Please enter your name:");
        // Store user's name in local storage
        localStorage.setItem('userName', userName);
    }

    socket.emit('user_connected', userName);

    function storeMessageLocally(data) {
        var messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
        messages.push({ sender: data.sender, message: data.message });
        localStorage.setItem('chatMessages', JSON.stringify(messages));

        // Check the number of stored messages and transfer to the database if a limit is reached
        if (messages.length >= 10000000000) { // Adjust the limit as needed
            transferMessagesToDatabase(messages);
            // Clear local storage after transfer
            localStorage.removeItem('chatMessages');
            // Update the UI to reflect the cleared local storage
            displayMessages([]);
        }
    }

    function transferMessagesToDatabase(messages) {
        // Implement the logic to transfer messages to the database here
        // You can use an API endpoint or another mechanism to send data to your server
        console.log("Transferring messages to the database:", messages);
        // Assume a successful transfer, you can add error handling if needed
    }

    function displayMessages(messages) {
        var ul = document.getElementById('messages');
        ul.innerHTML = '';  // Clear existing messages
        
        messages.forEach(function (data) {
            var li = document.createElement('li');
            var messageText = data.sender + ": " + data.message;
            messageText = messageText.replace(/•/g, '✨'); // Replace "•" with ✨ globally
            li.innerHTML = `<span>${messageText}</span>`;
            ul.appendChild(li);
        });
    }
    
    

    socket.on('message', function (data) {
        var ul = document.getElementById('messages');
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(data.sender + ": " + data.message));
        ul.appendChild(li);

        // Store the message in local storage and check for transfer to the database
        storeMessageLocally(data);

        // Alert the user about the new message
        alert("New message has arrived!🥳");
    });

    socket.on('previous_messages', function (messages) {
        displayMessages(messages);
    });

    // Retrieve and display previous messages on page load
    var storedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    displayMessages(storedMessages);

    // // Button to view previous messages
    // document.getElementById('view_previous').onclick = function () {
    //     alert("Viewing previous messages:\n" + storedMessages.map(msg => `${msg.sender}: ${msg.message}`).join("\n"));
    // };
    
    document.getElementById('send').onclick = function () {
        console.log('Send button clicked!');
        var message = document.getElementById('message_input').value;
        socket.emit('message', { sender: userName, message: message });
        document.getElementById('message_input').value = '';
    };
    
});
