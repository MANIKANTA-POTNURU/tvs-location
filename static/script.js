document.addEventListener("DOMContentLoaded", function() {
    const initialMessage = "Do you want to know the nearest locations?";
    appendMessage(initialMessage, 'bot', true);
});

document.getElementById("sendBtn").addEventListener("click", function() {
    const userInputElem = document.getElementById("userInput");
    const userInput = userInputElem.value.trim();

    appendMessage(userInput, 'user');

    if (userInput.toLowerCase().includes("nearest tvs office")) {
        fetchNearestLocations();
    } else {
        appendMessage("Sorry, I didn't understand that. If you need the nearest TVS office, please let me know!", 'bot');
    }

    userInputElem.value = "";
});

document.getElementById("saveBtn").addEventListener("click", function() {
    // Handle saving the chat transcript to a file (code provided earlier)
    // Replace with your own logic to save the chat content.
    saveChatTranscript();
});

function fetchNearestLocations() {
    navigator.geolocation.getCurrentPosition(success, error);
}

function success(position) {
    const latitude  = position.coords.latitude;
    const longitude = position.coords.longitude;

    fetch('/nearest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            lat: latitude,
            lng: longitude,
        }),
    })
    .then(response => response.json())
    .then(data => {
        data.locations.forEach(loc => {
            appendMessage(loc.address, 'bot', false, {distance: loc.distance, lat: loc.lat, lng: loc.lng}, latitude, longitude);
        });
    })
    .catch(error => {
        console.error('Error fetching nearest locations:', error);
        appendMessage("Sorry, I couldn't fetch the locations at the moment.", 'bot');
    });
}

function error() {
    appendMessage("I couldn't get your location. Please ensure you've given permissions and try again.", 'bot');
}

function appendMessage(message, sender, isClickable, location, userLat, userLng) {
    let messageElem = document.createElement("div");
    messageElem.className = sender + "-message";
    
    if (isClickable) {
        messageElem.addEventListener("click", fetchNearestLocations);
    }
    
    if (location) {
        messageElem.innerHTML = `
            <strong>Address:</strong> ${message}<br>
            <strong>Distance:</strong> ${location.distance.toFixed(2)} km<br>
            <button onclick="window.open('https://www.google.com/maps/dir/${userLat},${userLng}/${location.lat},${location.lng}')">See on Maps</button>`;
    } else {
        messageElem.textContent = message;
    }
    
    document.querySelector(".messages").appendChild(messageElem);
}

// Function to handle saving the chat transcript (example)
function saveChatTranscript() {
    const chatTranscript = getChatTranscript();
    
    // Create a Blob and download the transcript as a text file
    const blob = new Blob([chatTranscript], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = 'chat_transcript.txt';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function getChatTranscript() {
    // Implement the logic to collect the chat transcript
    // For example, you can iterate through the messages and format them as needed.
    const messages = document.querySelectorAll('.bot-message, .user-message');
    const transcript = Array.from(messages).map(message => message.textContent).join('\n');
    return transcript;
}
