// Demo data for GitHub Pages static version
const demoData = {
    requests: [
        {
            id: 1,
            name: "Demo User",
            type: "game",
            game_name: "Minecraft",
            platform: "",
            description: "Looking for Minecraft account with premium features",
            timestamp: "2026-05-12T00:00:00.000Z",
            status: "pending"
        }
    ],
    messages: [
        {
            id: 1,
            request_id: 1,
            sender: "Dogday17",
            text: "I can help you get that Minecraft account!",
            timestamp: "2026-05-12T00:05:00.000Z",
            type: "admin"
        }
    ],
    public_messages: [
        {
            id: 1,
            sender: "DemoUser",
            text: "Welcome to Wolfracy!",
            timestamp: "2026-05-12T00:10:00.000Z",
            type: "public"
        }
    ]
};

// Demo functions for GitHub Pages
window.demoData = demoData;

window.loadDemoData = function() {
    // Load demo requests
    const requestsContainer = document.getElementById('requestsContainer');
    if (requestsContainer && demoData.requests.length > 0) {
        requestsContainer.innerHTML = demoData.requests.map(req => `
            <div class="request-item">
                <h4>${req.name} - ${req.type === 'game' ? req.game_name : req.platform + ' Account'}</h4>
                <p>${req.description}</p>
                <small>${new Date(req.timestamp).toLocaleString()}</small>
            </div>
        `).join('');
    }

    // Load demo messages
    const adminChatMessages = document.getElementById('adminChatMessages');
    if (adminChatMessages && demoData.messages.length > 0) {
        adminChatMessages.innerHTML = demoData.messages.map(msg => `
            <div class="message received">
                <div class="message-author">${msg.sender}</div>
                <div class="message-text">${msg.text}</div>
                <small>${new Date(msg.timestamp).toLocaleString()}</small>
            </div>
        `).join('');
    }

    // Load demo public messages
    const publicChatMessages = document.getElementById('publicChatMessages');
    if (publicChatMessages && demoData.public_messages.length > 0) {
        publicChatMessages.innerHTML = demoData.public_messages.map(msg => `
            <div class="message received">
                <div class="message-author">${msg.sender}</div>
                <div class="message-text">${msg.text}</div>
                <small>${new Date(msg.timestamp).toLocaleString()}</small>
            </div>
        `).join('');
    }
};

// Auto-load demo data when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadDemoData, 1000);
});
