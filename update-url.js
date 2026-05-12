const https = require('https');
const http = require('http');

// Try multiple URL shorteners until one works
async function shortenUrl(ngrokUrl) {
    console.log(`Shortening: ${ngrokUrl}`);
    
    // Try is.gd first (reliable, no API key needed)
    try {
        const shortUrl = await shortenWithIsGd(ngrokUrl);
        console.log(`✅ Short URL: ${shortUrl}`);
        return shortUrl;
    } catch (error) {
        console.log(`is.gd failed: ${error.message}`);
    }
    
    // Try v.gd as backup
    try {
        const shortUrl = await shortenWithVGd(ngrokUrl);
        console.log(`✅ Short URL: ${shortUrl}`);
        return shortUrl;
    } catch (error) {
        console.log(`v.gd failed: ${error.message}`);
    }
    
    // Try tinyurl as last resort
    try {
        const shortUrl = await shortenWithTinyurl(ngrokUrl);
        console.log(`✅ Short URL: ${shortUrl}`);
        return shortUrl;
    } catch (error) {
        console.log(`tinyurl failed: ${error.message}`);
    }
    
    throw new Error('All URL shorteners failed');
}

function shortenWithIsGd(url) {
    return new Promise((resolve, reject) => {
        const encodedUrl = encodeURIComponent(url);
        const options = {
            hostname: 'is.gd',
            path: `/create.php?format=simple&url=${encodedUrl}`,
            method: 'GET'
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (data.startsWith('http')) {
                    resolve(data.trim());
                } else {
                    reject(new Error('Invalid response from is.gd'));
                }
            });
        });
        
        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
        req.end();
    });
}

function shortenWithVGd(url) {
    return new Promise((resolve, reject) => {
        const encodedUrl = encodeURIComponent(url);
        const options = {
            hostname: 'v.gd',
            path: `/create.php?format=simple&url=${encodedUrl}`,
            method: 'GET'
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (data.startsWith('http')) {
                    resolve(data.trim());
                } else {
                    reject(new Error('Invalid response from v.gd'));
                }
            });
        });
        
        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
        req.end();
    });
}

function shortenWithTinyurl(url) {
    return new Promise((resolve, reject) => {
        const encodedUrl = encodeURIComponent(url);
        const options = {
            hostname: 'tinyurl.com',
            path: `/api-create.php?url=${encodedUrl}`,
            method: 'GET'
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (data.startsWith('http')) {
                    resolve(data.trim());
                } else {
                    reject(new Error('Invalid response from tinyurl'));
                }
            });
        });
        
        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
        req.end();
    });
}

// Main execution
const ngrokUrl = process.argv[2];
if (!ngrokUrl) {
    console.error('Usage: node update-url.js <ngrok-url>');
    process.exit(1);
}

shortenUrl(ngrokUrl)
    .then(shortUrl => {
        console.log(`\n✅ SUCCESS! Your short URL is:`);
        console.log(`${shortUrl}`);
        console.log(`\n📋 Copy this URL to share with friends!`);
        process.exit(0);
    })
    .catch(error => {
        console.error(`\n❌ Error: ${error.message}`);
        console.log(`\n📋 Use this direct URL instead:`);
        console.log(`${ngrokUrl}`);
        process.exit(1);
    });
