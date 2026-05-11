// Static version for GitHub Pages - loads data from JSON files
let currentUser = null;
let requests = [];
let messages = [];
let publicMessages = [];

// Load data from JSON files
async function loadData() {
    try {
        // Load requests (try sample if main doesn't exist)
        let requestsResponse = await fetch('data/requests.json');
        if (!requestsResponse.ok) {
            requestsResponse = await fetch('data/sample-requests.json');
        }
        if (requestsResponse.ok) {
            requests = await requestsResponse.json();
        }
        
        // Load messages (try sample if main doesn't exist)
        let messagesResponse = await fetch('data/messages.json');
        if (!messagesResponse.ok) {
            messagesResponse = await fetch('data/sample-messages.json');
        }
        if (messagesResponse.ok) {
            messages = await messagesResponse.json();
        }
        
        // Load public messages (use sample data)
        const publicMessagesResponse = await fetch('data/sample-messages.json');
        if (publicMessagesResponse.ok) {
            publicMessages = await publicMessagesResponse.json();
        }
        
        console.log('Data loaded:', { requests, messages, publicMessages });
    } catch (error) {
        console.error('Error loading data:', error);
        // Initialize empty arrays if files don't exist
        requests = [];
        messages = [];
        publicMessages = [];
    }
}

// Save data to JSON files (simulated - won't actually save on GitHub Pages)
async function saveData() {
    console.log('Note: Data saving is disabled on GitHub Pages');
    console.log('In production, this would save to server');
}

// DOM elements
const requestsBtn = document.getElementById('requestsBtn');
const chatBtn = document.getElementById('chatBtn');
const adminBtn = document.getElementById('adminBtn');
const darkModeToggle = document.getElementById('darkModeToggle');
const requestPopup = document.getElementById('requestPopup');
const closePopup = document.getElementById('closePopup');
const requestForm = document.getElementById('requestForm');
const adminPanel = document.getElementById('adminPanel');
const closeAdmin = document.getElementById('closeAdmin');
const adminLoginPopup = document.getElementById('adminLoginPopup');
const closeAdminLogin = document.getElementById('closeAdminLogin');
const adminLoginForm = document.getElementById('adminLoginForm');
const chatPanel = document.getElementById('chatPanel');
const closeChat = document.getElementById('closeChat');
const messageList = document.getElementById('messageList');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const requestList = document.getElementById('requestList');
const requestTitle = document.getElementById('requestTitle');
const requestDescription = document.getElementById('requestDescription');
const submitRequestBtn = document.getElementById('submitRequestBtn');
const adminUsername = document.getElementById('adminUsername');
const adminPassword = document.getElementById('adminPassword');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const requestItemsList = document.getElementById('requestItemsList');
const adminMessagesList = document.getElementById('adminMessagesList');
const clearDataBtn = document.getElementById('clearDataBtn');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initializeEventListeners();
    loadDarkMode();
});

function initializeEventListeners() {
    // Navigation
    requestsBtn.addEventListener('click', showRequestPopup);
    chatBtn.addEventListener('click', showChatPanel);
    adminBtn.addEventListener('click', showAdminLogin);
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Request popup
    closePopup.addEventListener('click', hideRequestPopup);
    requestForm.addEventListener('submit', handleRequestSubmit);
    
    // Admin panel
    closeAdmin.addEventListener('click', hideAdminPanel);
    adminLoginForm.addEventListener('submit', handleAdminLogin);
    clearDataBtn.addEventListener('click', clearAllData);
    
    // Chat
    closeChat.addEventListener('click', hideChatPanel);
    sendMessageBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

// Request functions
function showRequestPopup() {
    requestPopup.classList.add('active');
}

function hideRequestPopup() {
    requestPopup.classList.remove('active');
    requestForm.reset();
}

async function handleRequestSubmit(e) {
    e.preventDefault();
    
    const title = requestTitle.value.trim();
    const description = requestDescription.value.trim();
    
    if (!title || !description) {
        alert('Please fill in all fields');
        return;
    }
    
    const newRequest = {
        id: Date.now(),
        title,
        description,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    requests.push(newRequest);
    await saveData();
    updateRequestDisplay();
    hideRequestPopup();
    
    // Show success message
    showNotification('Request submitted successfully!');
}

function updateRequestDisplay() {
    if (requestItemsList) {
        requestItemsList.innerHTML = '';
        requests.forEach(request => {
            const item = createRequestItem(request);
            requestItemsList.appendChild(item);
        });
    }
}

function createRequestItem(request) {
    const div = document.createElement('div');
    div.className = 'request-item';
    div.innerHTML = `
        <h4>${request.title}</h4>
        <p>${request.description}</p>
        <small>Status: ${request.status} | ${new Date(request.createdAt).toLocaleDateString()}</small>
    `;
    return div;
}

// Chat functions
function showChatPanel() {
    chatPanel.classList.add('active');
    updateChatDisplay();
}

function hideChatPanel() {
    chatPanel.classList.remove('active');
}

function updateChatDisplay() {
    if (messageList) {
        messageList.innerHTML = '';
        publicMessages.forEach(message => {
            const item = createMessageItem(message);
            messageList.appendChild(item);
        });
        messageList.scrollTop = messageList.scrollHeight;
    }
}

function createMessageItem(message) {
    const div = document.createElement('div');
    div.className = 'message-item';
    div.innerHTML = `
        <strong>${message.username}:</strong> ${message.text}
        <small>${new Date(message.timestamp).toLocaleTimeString()}</small>
    `;
    return div;
}

async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;
    
    const newMessage = {
        id: Date.now(),
        username: currentUser ? currentUser.username : 'Guest',
        text,
        timestamp: new Date().toISOString()
    };
    
    publicMessages.push(newMessage);
    await saveData();
    updateChatDisplay();
    messageInput.value = '';
}

// Admin functions
function showAdminLogin() {
    adminLoginPopup.classList.add('active');
}

function hideAdminLogin() {
    adminLoginPopup.classList.remove('active');
    adminLoginForm.reset();
}

async function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = adminUsername.value.trim();
    const password = adminPassword.value.trim();
    
    // Simple admin check (in production, use proper authentication)
    if (username === 'admin' && password === 'password') {
        currentUser = { username, role: 'admin' };
        hideAdminLogin();
        showAdminPanel();
    } else {
        alert('Invalid credentials');
    }
}

function showAdminPanel() {
    adminPanel.classList.add('active');
    updateAdminDisplay();
}

function hideAdminPanel() {
    adminPanel.classList.remove('active');
}

function updateAdminDisplay() {
    if (requestItemsList) {
        updateRequestDisplay();
    }
    if (adminMessagesList) {
        adminMessagesList.innerHTML = '';
        messages.forEach(message => {
            const item = createMessageItem(message);
            adminMessagesList.appendChild(item);
        });
    }
}

async function clearAllData() {
    if (confirm('Are you sure you want to clear all data?')) {
        requests = [];
        messages = [];
        publicMessages = [];
        await saveData();
        updateRequestDisplay();
        updateChatDisplay();
        updateAdminDisplay();
        showNotification('All data cleared');
    }
}

// Dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    darkModeToggle.textContent = isDark ? 'Light' : 'Dark';
}

function loadDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = 'Light';
    }
}

// Notifications
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
