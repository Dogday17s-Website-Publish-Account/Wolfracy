// Simple Node.js Server for Dogracy with JSON File Storage
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Data storage files
const DB_FILES = {
    requests: './data/requests.json',
    messages: './data/messages.json',
    public_messages: './data/public_messages.json'
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize data directory and files
async function initializeData() {
    try {
        await fs.mkdir('./data', { recursive: true });
        
        for (const [table, file] of Object.entries(DB_FILES)) {
            try {
                await fs.access(file);
            } catch {
                await fs.writeFile(file, '[]');
            }
        }
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// Read data from file
async function readData(table) {
    try {
        const data = await fs.readFile(DB_FILES[table], 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${table}:`, error);
        return [];
    }
}

// Write data to file
async function writeData(table, data) {
    try {
        await fs.writeFile(DB_FILES[table], JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${table}:`, error);
        return false;
    }
}

// Database API endpoint
app.post('/api/db', async (req, res) => {
    try {
        const { query, params = [] } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        let result = [];
        
        // Handle different query types
        if (query.includes('SELECT')) {
            // Handle SELECT queries
            if (query.includes('requests')) {
                result = await readData('requests');
            } else if (query.includes('messages')) {
                result = await readData('messages');
            } else if (query.includes('public_messages')) {
                result = await readData('public_messages');
            }
        } else if (query.includes('INSERT')) {
            // Handle INSERT queries
            let table, data;
            if (query.includes('requests')) {
                table = 'requests';
                data = {
                    id: Date.now(),
                    name: params[0] || 'Unknown',
                    type: params[1] || 'game',
                    game_name: params[2] || '',
                    platform: params[3] || 'steam',
                    description: params[4] || '',
                    timestamp: new Date().toISOString(),
                    status: 'pending'
                };
            } else if (query.includes('messages')) {
                table = 'messages';
                data = {
                    id: Date.now(),
                    request_id: parseInt(params[0]) || 0,
                    sender: params[1] || 'Admin',
                    text: params[2] || '',
                    timestamp: new Date().toISOString(),
                    type: 'admin'
                };
            } else if (query.includes('public_messages')) {
                table = 'public_messages';
                data = {
                    id: Date.now(),
                    sender: params[0] || 'User',
                    text: params[1] || '',
                    timestamp: new Date().toISOString(),
                    type: 'public'
                };
            }
            
            if (table && data) {
                const currentData = await readData(table);
                currentData.push(data);
                await writeData(table, currentData);
                result = [{ id: data.id }];
            }
        } else if (query.includes('DELETE')) {
            // Handle DELETE queries
            let table;
            if (query.includes('requests')) {
                table = 'requests';
            } else if (query.includes('messages')) {
                table = 'messages';
            } else if (query.includes('public_messages')) {
                table = 'public_messages';
            }
            
            if (table && params[0]) {
                const currentData = await readData(table);
                const filteredData = currentData.filter(item => item.id != params[0]);
                await writeData(table, filteredData);
                result = [{ deleted: params[0] }];
            }
        }
        
        res.status(200).json({ 
            success: true, 
            rows: result,
            count: result.length 
        });

    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            error: 'Database query failed',
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running!', timestamp: new Date().toISOString() });
});
// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running!', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Dogracy server running on http://0.0.0.0:${PORT}`);
    console.log('🌍 Local access: http://localhost:' + PORT);
    console.log('📱 Network access: http://YOUR_LAN_IP:' + PORT);
    console.log('🔗 Find your IP: Run \'ipconfig\' (Windows) or \'ifconfig\' (Mac/Linux)');
    console.log('🌐 Share your IP with friends to access globally!');
    console.log('💾 Using JSON file storage - no database required!');
    
    // Initialize data files
    await initializeData();
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server gracefully...');
    process.exit(0);
});
