// Client-side database for GitHub Pages using localStorage
class ClientDB {
    constructor() {
        this.dbName = 'wolfracy_db';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.dbName)) {
            const initialData = {
                requests: [],
                messages: [],
                public_messages: []
            };
            localStorage.setItem(this.dbName, JSON.stringify(initialData));
        }
    }

    getData() {
        return JSON.parse(localStorage.getItem(this.dbName) || '{}');
    }

    saveData(data) {
        localStorage.setItem(this.dbName, JSON.stringify(data));
    }

    async executeQuery(operation, params = []) {
        const data = this.getData();
        let result = [];

        if (operation.includes('SELECT')) {
            if (operation.includes('requests')) {
                result = data.requests;
            } else if (operation.includes('messages')) {
                result = data.messages;
            } else if (operation.includes('public_messages')) {
                result = data.public_messages;
            }
        } else if (operation.includes('INSERT')) {
            if (operation.includes('requests')) {
                const newRequest = {
                    id: Date.now(),
                    name: params[0] || 'Unknown',
                    type: params[1] || 'game',
                    game_name: params[2] || '',
                    platform: params[3] || 'steam',
                    description: params[4] || '',
                    timestamp: new Date().toISOString(),
                    status: 'pending'
                };
                data.requests.push(newRequest);
                result = [{ id: newRequest.id }];
            } else if (operation.includes('messages')) {
                const newMessage = {
                    id: Date.now(),
                    request_id: parseInt(params[0]) || 0,
                    sender: params[1] || 'Admin',
                    text: params[2] || '',
                    timestamp: new Date().toISOString(),
                    type: 'admin'
                };
                data.messages.push(newMessage);
                result = [{ id: newMessage.id }];
            } else if (operation.includes('public_messages')) {
                const newPublicMessage = {
                    id: Date.now(),
                    sender: params[0] || 'User',
                    text: params[1] || '',
                    timestamp: new Date().toISOString(),
                    type: 'public'
                };
                data.public_messages.push(newPublicMessage);
                result = [{ id: newPublicMessage.id }];
            }
            this.saveData(data);
        } else if (operation.includes('DELETE')) {
            if (operation.includes('requests')) {
                data.requests = data.requests.filter(item => item.id != params[0]);
                result = [{ deleted: params[0] }];
            } else if (operation.includes('messages')) {
                data.messages = data.messages.filter(item => item.id != params[0]);
                result = [{ deleted: params[0] }];
            } else if (operation.includes('public_messages')) {
                data.public_messages = data.public_messages.filter(item => item.id != params[0]);
                result = [{ deleted: params[0] }];
            }
            this.saveData(data);
        }

        return result;
    }

    // Add some demo data if empty
    addDemoData() {
        const data = this.getData();
        if (data.requests.length === 0) {
            const demoRequest = {
                id: Date.now(),
                name: "Demo User",
                type: "game",
                game_name: "Minecraft",
                platform: "",
                description: "Looking for Minecraft account with premium features",
                timestamp: new Date().toISOString(),
                status: "pending"
            };
            data.requests.push(demoRequest);

            const demoMessage = {
                id: Date.now() + 1,
                request_id: demoRequest.id,
                sender: "Dogday17",
                text: "I can help you get that Minecraft account!",
                timestamp: new Date().toISOString(),
                type: "admin"
            };
            data.messages.push(demoMessage);

            const demoPublicMessage = {
                id: Date.now() + 2,
                sender: "DemoUser",
                text: "Welcome to Wolfracy!",
                timestamp: new Date().toISOString(),
                type: "public"
            };
            data.public_messages.push(demoPublicMessage);

            this.saveData(data);
        }
    }
}

// Initialize client database
window.clientDB = new ClientDB();
window.clientDB.addDemoData();

// Override executeQuery for GitHub Pages
window.executeQuery = async function(operation, params = []) {
    try {
        // Try server first
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
        
        if (response.ok) {
            const result = await response.json();
            return result.rows || result || [];
        }
    } catch (error) {
        console.log('Server not available, using client database...');
    }
    
    // Fall back to client database
    return window.clientDB.executeQuery(operation, params);
};
