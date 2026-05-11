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

// Request form elements
const userName = document.getElementById('userName');
const requestType = document.getElementById('requestType');
const gameName = document.getElementById('gameName');
const platform = document.getElementById('platform');
const description = document.getElementById('description');

// Tab elements
const newRequestTab = document.getElementById('newRequestTab');
const pendingTab = document.getElementById('pendingTab');
const newRequestContent = document.getElementById('newRequestContent');
const pendingContent = document.getElementById('pendingContent');
const pendingRequests = document.getElementById('pendingRequests');

// Request chat elements
const requestChatContent = document.getElementById('requestChatContent');
const backToPending = document.getElementById('backToPending');
const requestChatTitle = document.getElementById('requestChatTitle');
const requestChatMessages = document.getElementById('requestChatMessages');
const requestChatInput = document.getElementById('requestChatInput');
const requestSendBtn = document.getElementById('requestSendBtn');

// Admin elements
const requestsList = document.getElementById('requestsList');
const requestsContainer = document.getElementById('requestsContainer');
const adminChatMessages = document.getElementById('adminChatMessages');
const adminChatInput = document.getElementById('adminChatInput');
const adminSendBtn = document.getElementById('adminSendBtn');

// Public chat elements
const publicChatMessages = document.getElementById('publicChatMessages');
const publicChatInput = document.getElementById('publicChatInput');
const publicSendBtn = document.getElementById('publicSendBtn');

// Admin login elements
const adminUsername = document.getElementById('adminUsername');
const adminPassword = document.getElementById('adminPassword');

// Notification elements
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initializeEventListeners();
    loadDarkMode();
});

function initializeEventListeners() {
    // Navigation
    if (requestsBtn) requestsBtn.addEventListener('click', showRequestPopup);
    if (chatBtn) chatBtn.addEventListener('click', showChatPanel);
    if (adminBtn) adminBtn.addEventListener('click', showAdminLogin);
    if (darkModeToggle) darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Request popup
    if (closePopup) closePopup.addEventListener('click', hideRequestPopup);
    if (requestForm) requestForm.addEventListener('submit', handleRequestSubmit);
    
    // Request type change
    if (requestType) requestType.addEventListener('change', handleRequestTypeChange);
    
    // Tab switching
    if (newRequestTab) newRequestTab.addEventListener('click', () => switchTab('newRequest'));
    if (pendingTab) pendingTab.addEventListener('click', () => switchTab('pending'));
    
    // Request chat
    if (backToPending) backToPending.addEventListener('click', closeRequestChat);
    if (requestSendBtn) requestSendBtn.addEventListener('click', sendRequestMessage);
    if (requestChatInput) requestChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendRequestMessage();
    });
    
    // Admin panel
    if (closeAdmin) closeAdmin.addEventListener('click', hideAdminPanel);
    if (adminLoginForm) adminLoginForm.addEventListener('submit', handleAdminLogin);
    if (adminSendBtn) adminSendBtn.addEventListener('click', sendAdminMessage);
    if (adminChatInput) adminChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendAdminMessage();
    });
    
    // Public chat
    if (closeChat) closeChat.addEventListener('click', hideChatPanel);
    if (publicSendBtn) publicSendBtn.addEventListener('click', sendPublicMessage);
    if (publicChatInput) publicChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendPublicMessage();
    });
}

// Request type change handler
function handleRequestTypeChange() {
    if (!requestType || !gameNameGroup || !platformGroup) return;
    
    if (requestType.value === 'game') {
        gameNameGroup.style.display = 'block';
        platformGroup.style.display = 'none';
    } else {
        gameNameGroup.style.display = 'none';
        platformGroup.style.display = 'block';
    }
}

// Tab switching
function switchTab(tab) {
    // Remove active class from all tabs and content
    const allTabs = [newRequestTab, pendingTab];
    const allContent = [newRequestContent, pendingContent];
    
    allTabs.forEach(t => t?.classList.remove('active'));
    allContent.forEach(c => c?.classList.remove('active'));
    
    if (tab === 'newRequest') {
        newRequestTab?.classList.add('active');
        newRequestContent?.classList.add('active');
    } else {
        pendingTab?.classList.add('active');
        pendingContent?.classList.add('active');
        renderPendingRequests();
    }
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
    
    const name = userName?.value?.trim() || 'Guest';
    const type = requestType?.value || 'game';
    const game = gameName?.value?.trim() || '';
    const plat = platform?.value || '';
    const desc = description?.value?.trim() || '';
    
    if (!desc) {
        alert('Please fill in all fields');
        return;
    }
    
    const newRequest = {
        id: Date.now(),
        name: name,
        type: type,
        gameName: game,
        platform: plat,
        description: desc,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    requests.push(newRequest);
    await saveData();
    switchTab('pending'); // Show pending requests
    hideRequestPopup();
    
    showNotification('Request submitted successfully!');
}

function renderPendingRequests() {
    if (!pendingRequests) return;
    
    const userRequests = requests.filter(r => r.name === (localStorage.getItem('wolfracy_user_name') || 'Guest'));
    
    if (userRequests.length === 0) {
        pendingRequests.innerHTML = '<p class="no-pending">No pending requests</p>';
        return;
    }
    
    pendingRequests.innerHTML = '';
    userRequests.forEach(request => {
        const item = createRequestItem(request);
        item.addEventListener('click', () => openRequestChat(request));
        pendingRequests.appendChild(item);
    });
}

function createRequestItem(request) {
    const div = document.createElement('div');
    div.className = 'request-item';
    div.innerHTML = `
        <h4>${request.type === 'game' ? request.gameName : request.platform + ' Account'}</h4>
        <p>${request.description}</p>
        <small>Status: ${request.status} | ${new Date(request.createdAt).toLocaleDateString()}</small>
    `;
    return div;
}

// Request chat functions
let currentRequestChat = null;

function openRequestChat(request) {
    currentRequestChat = request;
    
    if (requestChatContent) requestChatContent.style.display = 'block';
    if (pendingContent) pendingContent.style.display = 'none';
    
    if (requestChatTitle) {
        requestChatTitle.textContent = request.type === 'game' ? request.gameName : request.platform + ' Account';
    }
    
    loadRequestMessages(request.id);
}

function closeRequestChat() {
    currentRequestChat = null;
    if (requestChatContent) requestChatContent.style.display = 'none';
    if (pendingContent) pendingContent.style.display = 'block';
}

function loadRequestMessages(requestId) {
    if (!requestChatMessages) return;
    requestChatMessages.innerHTML = '';
    
    const requestMessages = messages.filter(m => m.requestId === requestId);
    requestMessages.forEach(message => {
        const item = createMessageItem(message);
        requestChatMessages.appendChild(item);
    });
}

async function sendRequestMessage() {
    const text = requestChatInput?.value?.trim();
    if (!text || !currentRequestChat) return;
    
    const newMessage = {
        id: Date.now(),
        requestId: currentRequestChat.id,
        sender: 'User',
        text,
        timestamp: new Date().toISOString()
    };
    
    messages.push(newMessage);
    await saveData();
    loadRequestMessages(currentRequestChat.id);
    if (requestChatInput) requestChatInput.value = '';
}

// Public chat functions
function showChatPanel() {
    chatPanel.classList.add('active');
    updatePublicChatDisplay();
}

function hideChatPanel() {
    chatPanel.classList.remove('active');
}

function updatePublicChatDisplay() {
    if (!publicChatMessages) return;
    
    publicChatMessages.innerHTML = '';
    publicMessages.forEach(message => {
        const item = createMessageItem(message);
        publicChatMessages.appendChild(item);
    });
    publicChatMessages.scrollTop = publicChatMessages.scrollHeight;
}

function createMessageItem(message) {
    const div = document.createElement('div');
    div.className = 'message-item';
    div.innerHTML = `
        <strong>${message.sender || message.username}:</strong> ${message.text}
        <small>${new Date(message.timestamp).toLocaleTimeString()}</small>
    `;
    return div;
}

async function sendPublicMessage() {
    const text = publicChatInput?.value?.trim();
    if (!text) return;
    
    const newMessage = {
        id: Date.now(),
        username: localStorage.getItem('wolfracy_user_name') || 'Guest',
        text,
        timestamp: new Date().toISOString()
    };
    
    publicMessages.push(newMessage);
    await saveData();
    updatePublicChatDisplay();
    if (publicChatInput) publicChatInput.value = '';
}

// Admin functions
function showAdminLogin() {
    adminLoginPopup?.classList.add('active');
}

function hideAdminLogin() {
    adminLoginPopup?.classList.remove('active');
    adminLoginForm?.reset();
}

async function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = adminUsername?.value?.trim();
    const password = adminPassword?.value?.trim();
    
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
    adminPanel?.classList.add('active');
    updateAdminDisplay();
}

function hideAdminPanel() {
    adminPanel?.classList.remove('active');
}

function updateAdminDisplay() {
    if (requestsContainer) {
        renderRequests();
    }
    if (adminChatMessages) {
        renderAdminMessages();
    }
}

function renderRequests() {
    if (!requestsContainer) return;
    
    requestsContainer.innerHTML = '';
    requests.forEach(request => {
        const item = createAdminRequestItem(request);
        requestsContainer.appendChild(item);
    });
}

function createAdminRequestItem(request) {
    const div = document.createElement('div');
    div.className = 'admin-request-item';
    div.innerHTML = `
        <h4>${request.type === 'game' ? request.gameName : request.platform + ' Account'}</h4>
        <p><strong>From:</strong> ${request.name}</p>
        <p><strong>Description:</strong> ${request.description}</p>
        <p><strong>Status:</strong> ${request.status}</p>
        <small>${new Date(request.createdAt).toLocaleString()}</small>
        <button onclick="selectRequest(${JSON.stringify(request).replace(/"/g, '&quot;')})">Respond</button>
        <button onclick="deleteRequest(${request.id})">Delete</button>
    `;
    return div;
}

function renderAdminMessages() {
    if (!adminChatMessages) return;
    
    adminChatMessages.innerHTML = '';
    messages.forEach(message => {
        const item = createMessageItem(message);
        adminChatMessages.appendChild(item);
    });
}

function selectRequest(request) {
    if (!adminChatInput) return;
    
    adminChatInput.dataset.requestId = request.id;
    adminChatInput.placeholder = `Responding to: ${request.type === 'game' ? request.gameName : request.platform + ' Account'}`;
    
    // Show request details
    if (adminChatMessages) {
        adminChatMessages.innerHTML = `
            <div class="request-details">
                <h4>Request Details</h4>
                <p><strong>From:</strong> ${request.name}</p>
                <p><strong>Type:</strong> ${request.type}</p>
                <p><strong>Description:</strong> ${request.description}</p>
            </div>
        `;
    }
}

async function deleteRequest(requestId) {
    if (!confirm('Are you sure you want to delete this request?')) return;
    
    requests = requests.filter(r => r.id !== requestId);
    await saveData();
    renderRequests();
    showNotification('Request deleted');
}

async function sendAdminMessage() {
    const text = adminChatInput?.value?.trim();
    const requestId = adminChatInput?.dataset?.requestId;
    
    if (!text || !requestId) return;
    
    const newMessage = {
        id: Date.now(),
        requestId: parseInt(requestId),
        sender: 'Admin',
        text,
        timestamp: new Date().toISOString()
    };
    
    messages.push(newMessage);
    await saveData();
    
    if (adminChatInput) adminChatInput.value = '';
    renderAdminMessages();
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
