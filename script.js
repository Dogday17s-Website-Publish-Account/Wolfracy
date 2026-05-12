// JSON File Storage - using REST API approach

// Global state
let currentUser = null;
let requests = [];
let messages = [];
let publicMessages = [];

// Simple database functions using JSON file storage
async function executeQuery(operation, params = []) {
    try {
        const response = await fetch('/api/db', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                query: operation,
                params: params 
            }),
        });
        
        if (!response.ok) {
            throw new Error('Query failed');
        }
        
        const result = await response.json();
        return result.rows || result || [];
    } catch (error) {
        console.error('Database error:', error);
        return [];
    }
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
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');

// Form elements
const requestType = document.getElementById('requestType');
const gameNameGroup = document.getElementById('gameNameGroup');
const platformGroup = document.getElementById('platformGroup');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    checkForAdmin();
    setupEventListeners();
    requestNotificationPermission();
    initializeDarkMode();
    
    // Set up real-time listeners
    setupRealtimeListeners();
});

// Initialize dark mode
function initializeDarkMode() {
    const darkMode = localStorage.getItem('dogracy_dark_mode');
    if (darkMode === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = 'Light';
    }
}

// Load data from JSON file storage
async function loadData() {
    try {
        console.log('Loading data from JSON storage...');
        
        // Load requests
        const requestsData = await executeQuery('SELECT * FROM requests');
        console.log('Requests data:', requestsData);
        requests = requestsData;

        // Load messages
        const messagesData = await executeQuery('SELECT * FROM messages');
        console.log('Messages data:', messagesData);
        messages = messagesData;

        // Load public messages
        const publicMessagesData = await executeQuery('SELECT * FROM public_messages');
        console.log('Public messages data:', publicMessagesData);
        publicMessages = publicMessagesData;

        console.log('Data loaded successfully!');

    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading data: ' + error.message, 'error');
    }
}

// Save data to JSON storage
async function saveRequest(request) {
    try {
        const result = await executeQuery(
            'INSERT INTO requests (name, type, game_name, platform, description)',
            [request.name, request.type, request.game_name, request.platform, request.description]
        );
        return result[0];
    } catch (error) {
        console.error('Error saving request:', error);
        throw error;
    }
}

async function saveMessage(message) {
    try {
        const result = await executeQuery(
            'INSERT INTO messages',
            [message.request_id, message.sender, message.text]
        );
        return result[0];
    } catch (error) {
        console.error('Error saving message:', error);
        showNotification('Error saving message', 'error');
    }
}

async function savePublicMessage(message) {
    try {
        const result = await executeQuery(
            'INSERT INTO public_messages',
            [message.sender, message.text]
        );
        return result[0];
    } catch (error) {
        console.error('Error saving public message:', error);
        showNotification('Error saving message', 'error');
    }
}

async function deleteRequestFromDB(requestId) {
    try {
        await executeQuery('DELETE FROM requests', [requestId]);
    } catch (error) {
        console.error('Error deleting request:', error);
        showNotification('Error deleting request', 'error');
    }
}

async function deleteMessagesFromDB(requestId) {
    try {
        await executeQuery('DELETE FROM messages', [requestId]);
    } catch (error) {
        console.error('Error deleting messages:', error);
        showNotification('Error deleting messages', 'error');
    }
}

// Check if user is admin
function checkForAdmin() {
    const loginData = localStorage.getItem('dogracy_admin_login');
    if (loginData) {
        const parsed = JSON.parse(loginData);
        // Check if login is still valid (7 days)
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - parsed.timestamp < sevenDays) {
            currentUser = { username: parsed.username, isAdmin: true };
            adminBtn.style.display = 'block';
        } else {
            // Clear expired login
            localStorage.removeItem('dogracy_admin_login');
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    requestsBtn.addEventListener('click', openRequestPopup);
    chatBtn.addEventListener('click', openChatPanel);
    adminBtn.addEventListener('click', openAdminLoginPopup);
    darkModeToggle.addEventListener('click', toggleDarkMode);
    closePopup.addEventListener('click', closeRequestPopup);
    closeAdmin.addEventListener('click', closeAdminPanel);
    closeChat.addEventListener('click', closeChatPanel);
    closeAdminLogin.addEventListener('click', closeAdminLoginPopup);
    requestForm.addEventListener('submit', handleRequestSubmit);
    adminLoginForm.addEventListener('submit', handleAdminLogin);
    requestType.addEventListener('change', handleRequestTypeChange);
    
    // Tab event listeners
    document.getElementById('newRequestTab').addEventListener('click', () => switchTab('newRequest'));
    document.getElementById('pendingTab').addEventListener('click', () => switchTab('pending'));
    
    // Request chat event listeners
    document.getElementById('backToPending').addEventListener('click', closeRequestChat);
    document.getElementById('requestSendBtn').addEventListener('click', sendRequestMessage);
    document.getElementById('requestChatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendRequestMessage();
    });
    
    // Close popup when clicking outside
    requestPopup.addEventListener('click', (e) => {
        if (e.target === requestPopup) {
            closeRequestPopup();
        }
    });
    
    adminLoginPopup.addEventListener('click', (e) => {
        if (e.target === adminLoginPopup) {
            closeAdminLoginPopup();
        }
    });
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    darkModeToggle.textContent = isDarkMode ? 'Light' : 'Dark';
    localStorage.setItem('dogracy_dark_mode', isDarkMode);
}

// Open admin login popup
function openAdminLoginPopup() {
    adminLoginPopup.classList.add('active');
}

// Close admin login popup
function closeAdminLoginPopup() {
    adminLoginPopup.classList.remove('active');
    adminLoginForm.reset();
}

// Switch tabs
function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    
    if (tab === 'newRequest') {
        document.getElementById('newRequestTab').classList.add('active');
        document.getElementById('newRequestContent').classList.add('active');
    } else {
        document.getElementById('pendingTab').classList.add('active');
        document.getElementById('pendingContent').classList.add('active');
        renderPendingRequests();
    }
}

// Handle admin login
function handleAdminLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(adminLoginForm);
    const username = formData.get('adminUsername');
    const password = formData.get('adminPassword');
    
    if (username === 'Dogday17' && password === 'Doggy Dogday17') {
        currentUser = { username: 'Dogday17', isAdmin: true };
        // Set persistent login with expiration
        const loginData = {
            username: username,
            password: password,
            timestamp: Date.now()
        };
        localStorage.setItem('dogracy_admin_login', JSON.stringify(loginData));
        
        closeAdminLoginPopup();
        showNotification('Login successful!');
        openAdminPanel();
    } else {
        showNotification('Invalid credentials!', 'error');
    }
}

// Request type change handler
function handleRequestTypeChange() {
    const type = requestType.value;
    if (type === 'game') {
        gameNameGroup.style.display = 'flex';
        platformGroup.style.display = 'none';
    } else {
        gameNameGroup.style.display = 'none';
        platformGroup.style.display = 'flex';
    }
}

// Open request popup with animation
function openRequestPopup() {
    requestPopup.classList.add('active');
}

// Close request popup
function closeRequestPopup() {
    requestPopup.classList.remove('active');
    requestForm.reset();
}

// Render pending requests for users
function renderPendingRequests() {
    const container = document.getElementById('pendingRequests');
    const userName = localStorage.getItem('dogracy_user_name') || 'Guest';
    
    // Filter requests for this user
    const userRequests = requests.filter(r => r.name === userName);
    
    if (userRequests.length === 0) {
        container.innerHTML = '<p class="no-pending">No pending requests</p>';
        return;
    }
    
    container.innerHTML = '';
    
    userRequests.forEach(request => {
        const requestElement = document.createElement('div');
        requestElement.className = 'pending-request-item';
        requestElement.style.cursor = 'pointer';
        
        // Get admin messages for this request
        const requestMessages = messages.filter(m => m.requestId === request.id);
        const hasUnread = requestMessages.length > 0;
        
        requestElement.innerHTML = `
            <h4>${request.type === 'game' ? request.gameName : request.platform + ' Account'}</h4>
            <p>${request.description}</p>
            <span class="status ${request.status}">${request.status}</span>
            ${hasUnread ? `
                <div class="unread-indicator">
                    💬 ${requestMessages.length} message${requestMessages.length > 1 ? 's' : ''}
                </div>
            ` : ''}
            <small>${new Date(request.timestamp).toLocaleString()}</small>
        `;
        
        // Make clickable to open request chat
        requestElement.addEventListener('click', () => openRequestChat(request));
        
        container.appendChild(requestElement);
    });
}

// Open request chat for a specific request
let currentRequestChat = null;

function openRequestChat(request) {
    currentRequestChat = request;
    
    // Switch to request chat tab
    document.getElementById('pendingContent').style.display = 'none';
    document.getElementById('requestChatContent').style.display = 'block';
    
    // Set chat title
    document.getElementById('requestChatTitle').textContent = 
        request.type === 'game' ? request.gameName : request.platform + ' Account';
    
    // Load request messages
    loadRequestMessages(request.id);
}

function closeRequestChat() {
    currentRequestChat = null;
    document.getElementById('requestChatContent').style.display = 'none';
    document.getElementById('pendingContent').style.display = 'block';
}

function loadRequestMessages(requestId) {
    const container = document.getElementById('requestChatMessages');
    container.innerHTML = '';
    
    // Get messages for this request
    const requestMessages = messages.filter(m => m.requestId === requestId);
    
    if (requestMessages.length === 0) {
        container.innerHTML = '<p class="no-messages">No messages yet. Start the conversation!</p>';
        return;
    }
    
    requestMessages.forEach(msg => {
        const isCurrentUser = msg.sender === localStorage.getItem('dogracy_user_name') || 
                              (currentUser && currentUser.isAdmin && msg.sender === 'Dogday17');
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isCurrentUser ? 'sent' : 'received'}`;
        
        // Add delete button for admin
        const deleteButton = (currentUser && currentUser.isAdmin) ? 
            `<button class="delete-msg-btn" data-msg-id="${msg.id}">×</button>` : '';
        
        messageElement.innerHTML = `
            <div class="message-author">${msg.sender}</div>
            <div class="message-text">${msg.text}</div>
            <small>${new Date(msg.timestamp).toLocaleString()}</small>
            ${deleteButton}
        `;
        
        container.appendChild(messageElement);
        
        // Add delete functionality
        if (deleteButton) {
            messageElement.querySelector('.delete-msg-btn').addEventListener('click', () => {
                deleteMessage(msg.id);
            });
        }
    });
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

async function deleteMessage(messageId) {
    if (confirm('Are you sure you want to delete this message?')) {
        try {
            await executeQuery('DELETE FROM messages', [messageId]);
            await loadData();
            if (currentRequestChat) {
                loadRequestMessages(currentRequestChat.id);
            }
            showNotification('Message deleted!');
        } catch (error) {
            console.error('Error deleting message:', error);
            showNotification('Error deleting message', 'error');
        }
    }
}

async function sendRequestMessage() {
    const input = document.getElementById('requestChatInput');
    const text = input.value.trim();
    
    if (!text || !currentRequestChat) return;
    
    const sender = currentUser && currentUser.isAdmin ? 'Dogday17' : 
                   localStorage.getItem('dogracy_user_name') || 'Guest';
    
    const message = {
        request_id: currentRequestChat.id,
        sender: sender,
        text: text,
        timestamp: new Date().toISOString(),
        type: 'request'
    };
    
    try {
        await saveMessage(message);
        input.value = '';
        await loadData();
        loadRequestMessages(currentRequestChat.id);
        showNotification('Message sent!');
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Error sending message', 'error');
    }
}

// Set up polling for real-time updates (simpler than WebSockets)
function setupRealtimeListeners() {
    // Poll every 5 seconds for new data
    setInterval(async () => {
        await loadData();
        if (currentUser && currentUser.isAdmin) {
            renderRequests();
            renderAdminMessages();
        }
        renderPendingRequests();
        renderPublicMessages();
        
        // Refresh request chat if open
        if (currentRequestChat) {
            loadRequestMessages(currentRequestChat.id);
        }
    }, 5000);
}

// Handle request form submission
async function handleRequestSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(requestForm);
    const userName = formData.get('userName');
    
    // Save user name for future requests
    localStorage.setItem('dogracy_user_name', userName);
    
    const request = {
        name: userName,
        type: formData.get('requestType'),
        gameName: formData.get('gameName'),
        platform: formData.get('platform'),
        description: formData.get('description'),
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    await saveRequest(request);
    
    showNotification('Request submitted successfully!');
    closeRequestPopup();
}

// Open admin panel
function openAdminPanel() {
    adminPanel.style.display = 'flex';
    setTimeout(() => {
        adminPanel.classList.add('active');
    }, 10);
    renderRequests();
    renderAdminMessages();
}

// Close admin panel
function closeAdminPanel() {
    adminPanel.classList.remove('active');
    setTimeout(() => {
        adminPanel.style.display = 'none';
    }, 300);
}

// Render requests in admin panel
function renderRequests() {
    const container = document.getElementById('requestsContainer');
    container.innerHTML = '';
    
    requests.forEach(request => {
        const requestElement = document.createElement('div');
        requestElement.className = 'request-item';
        requestElement.innerHTML = `
            <button class="delete-request-btn" data-request-id="${request.id}">×</button>
            <h4>${request.name} - ${request.type === 'game' ? request.gameName : request.platform + ' Account'}</h4>
            <p>${request.description}</p>
            <small>${new Date(request.timestamp).toLocaleString()}</small>
        `;
        
        // Add click listener for selecting request
        requestElement.addEventListener('click', (e) => {
            // Don't select if clicking delete button
            if (!e.target.classList.contains('delete-request-btn')) {
                selectRequest(request);
            }
        });
        
        // Add click listener for delete button
        const deleteBtn = requestElement.querySelector('.delete-request-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteRequest(request.id);
        });
        
        container.appendChild(requestElement);
    });
}

// Delete request
async function deleteRequest(requestId) {
    if (confirm('Are you sure you want to delete this request?')) {
        await deleteRequestFromDB(requestId);
        await deleteMessagesFromDB(requestId);
        
        renderRequests();
        
        // Clear chat if this request was selected
        const adminChatInput = document.getElementById('adminChatInput');
        if (adminChatInput.dataset.requestId == requestId) {
            adminChatInput.dataset.requestId = '';
            document.getElementById('adminChatMessages').innerHTML = '';
        }
        
        showNotification('Request deleted successfully!');
    }
}

// Select a request to respond to
function selectRequest(request) {
    const messageInput = document.getElementById('adminChatInput');
    messageInput.dataset.requestId = request.id;
    
    // Show request details in chat
    const chatMessages = document.getElementById('adminChatMessages');
    chatMessages.innerHTML = `
        <div class="message received">
            <div class="message-author">${request.name}</div>
            <div class="message-text">
                <strong>Type:</strong> ${request.type}<br>
                ${request.type === 'game' ? `<strong>Game:</strong> ${request.gameName}` : `<strong>Platform:</strong> ${request.platform}`}<br>
                <strong>Description:</strong> ${request.description}
            </div>
        </div>
    `;
    
    // Load existing messages
    const requestMessages = messages.filter(m => m.requestId === request.id);
    requestMessages.forEach(msg => {
        addMessageToChat(msg, 'adminChatMessages');
    });
}

// Open chat panel
function openChatPanel() {
    chatPanel.style.display = 'flex';
    setTimeout(() => {
        chatPanel.classList.add('active');
    }, 10);
    renderPublicMessages();
}

// Close chat panel
function closeChatPanel() {
    chatPanel.classList.remove('active');
    setTimeout(() => {
        chatPanel.style.display = 'none';
    }, 300);
}

// Render public messages
function renderPublicMessages() {
    const container = document.getElementById('publicChatMessages');
    container.innerHTML = '';
    
    // Only show public messages (not request-specific messages)
    publicMessages.forEach(msg => {
        addMessageToChat(msg, 'publicChatMessages');
    });
}

// Add message to chat
function addMessageToChat(message, containerId) {
    const container = document.getElementById(containerId);
    const messageElement = document.createElement('div');
    const isCurrentUser = message.sender === currentUser?.username;
    messageElement.className = `message ${isCurrentUser ? 'sent' : 'received'}`;
    
    // Add delete button for admin
    const deleteButton = (currentUser && currentUser.isAdmin && containerId === 'publicChatMessages') ? 
        `<button class="delete-msg-btn" data-msg-id="${message.id}">×</button>` : '';
    
    messageElement.innerHTML = `
        <div class="message-author">${message.sender}</div>
        <div class="message-text">${message.text}</div>
        <small>${new Date(message.timestamp).toLocaleString()}</small>
        ${deleteButton}
    `;
    
    container.appendChild(messageElement);
    container.scrollTop = container.scrollHeight;
    
    // Add delete functionality
    if (deleteButton) {
        messageElement.querySelector('.delete-msg-btn').addEventListener('click', () => {
            deletePublicMessage(message.id);
        });
    }
}

async function deletePublicMessage(messageId) {
    if (confirm('Are you sure you want to delete this public message?')) {
        try {
            await executeQuery('DELETE FROM public_messages', [messageId]);
            await loadData();
            renderPublicMessages();
            showNotification('Message deleted!');
        } catch (error) {
            console.error('Error deleting public message:', error);
            showNotification('Error deleting message', 'error');
        }
    }
}

// Setup admin chat
document.addEventListener('DOMContentLoaded', () => {
    const adminSendBtn = document.getElementById('adminSendBtn');
    const adminChatInput = document.getElementById('adminChatInput');
    
    if (adminSendBtn && adminChatInput) {
        adminSendBtn.addEventListener('click', sendAdminMessage);
        adminChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendAdminMessage();
            }
        });
    }
});

// Send admin message
async function sendAdminMessage() {
    const input = document.getElementById('adminChatInput');
    const requestId = input.dataset.requestId;
    const text = input.value.trim();
    
    if (!text || !requestId) return;
    
    const message = {
        request_id: parseInt(requestId),
        sender: 'Dogday17',
        text: text,
        timestamp: new Date().toISOString(),
        type: 'admin'
    };
    
    await saveMessage(message);
    
    addMessageToChat(message, 'adminChatMessages');
    input.value = '';
    
    showNotification('Message sent!');
    
    // Update request status to completed when admin responds
    await executeQuery('UPDATE requests SET status = $1 WHERE id = $2', ['completed', parseInt(requestId)]);
    
    // Show browser notification to user
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New message from Dogday17', {
            body: text,
            icon: '🎮'
        });
    }
    
    showNotification('User received your message!');
}

// Setup public chat
document.addEventListener('DOMContentLoaded', () => {
    const publicSendBtn = document.getElementById('publicSendBtn');
    const publicChatInput = document.getElementById('publicChatInput');
    
    if (publicSendBtn && publicChatInput) {
        publicSendBtn.addEventListener('click', sendPublicMessage);
        publicChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendPublicMessage();
            }
        });
    }
});

// Send public message
async function sendPublicMessage() {
    const input = document.getElementById('publicChatInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    const username = currentUser?.username || `User${Math.floor(Math.random() * 1000)}`;
    
    const message = {
        sender: username,
        text: text,
        timestamp: new Date().toISOString(),
        type: 'public'
    };
    
    await savePublicMessage(message);
    
    addMessageToChat(message, 'publicChatMessages');
    input.value = '';
    
    showNotification(`${username} sent a message in public chat`);
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Show notification
function showNotification(text, type = 'success') {
    notificationText.textContent = text;
    notification.style.display = 'block';
    
    if (type === 'error') {
        notification.style.background = 'var(--danger-color)';
    } else {
        notification.style.background = 'var(--primary-color)';
    }
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// File sharing functionality (simplified for demo)
function shareFiles(requestId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    
    input.onchange = (e) => {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileData = {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    data: e.target.result,
                    requestId: requestId,
                    timestamp: new Date().toISOString()
                };
                
                // Store file data (in real app, upload to server)
                const storedFiles = JSON.parse(localStorage.getItem('dogracy_files') || '[]');
                storedFiles.push(fileData);
                localStorage.setItem('dogracy_files', JSON.stringify(storedFiles));
                
                showNotification(`File ${file.name} shared successfully!`);
            };
            reader.readAsDataURL(file);
        });
    };
    
    input.click();
}

// Download file functionality
function downloadFile(fileId) {
    const storedFiles = JSON.parse(localStorage.getItem('dogracy_files') || '[]');
    const file = storedFiles.find(f => f.id === fileId);
    
    if (file) {
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        link.click();
    }
}
