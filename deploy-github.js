const fs = require('fs');
const path = require('path');

// Configuration - UPDATE THIS WITH YOUR USERNAME
const CONFIG = {
    githubUsername: 'YOUR_GITHUB_USERNAME',  // Replace with your actual GitHub username
    repoName: 'dogracy',
    branch: 'main'
};

function createGitHubRepo() {
    console.log('Creating GitHub repository structure...');
    
    // Create .github directory structure
    const githubDir = path.join(__dirname, '.github');
    const workflowsDir = path.join(githubDir, 'workflows');
    
    if (!fs.existsSync(githubDir)) {
        fs.mkdirSync(githubDir);
    }
    if (!fs.existsSync(workflowsDir)) {
        fs.mkdirSync(workflowsDir);
    }
    
    // Create README for GitHub Pages
    const readmeContent = `# ${CONFIG.repoName}

Dogracy web application with automatic URL redirection.

## Features
- Node.js server
- Real-time data synchronization
- Private messaging system
- URL shortener integration

## Deployment
This repository hosts the Dogracy web application with automatic redirects.

Live URL: https://${CONFIG.githubUsername}.github.io/${CONFIG.repoName}
`;

    fs.writeFileSync(path.join(__dirname, 'README.md'), readmeContent);
    
    console.log('✅ GitHub repository structure created');
}

function createGitignore() {
    const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Electron
electron
dist/electron

# Butane report cache
.burn

# Tern
.tern-project

# Beamer
*.nav
*.aux
*.out
*.synctex.gz
*.toc

# LaTeX
*.aux
*.dvi
*.log
*.fig
*.fls
*.fdb_latexmk
*.snm
*.synctex.gz

# macOS
.DS_Store

# Windows
Thumbs.db
ehthumbs.db
Desktop.ini

# Linux
*~

# Temporary files
*.tmp
*.temp
`;

    fs.writeFileSync(path.join(__dirname, '.gitignore'), gitignoreContent);
    console.log('✅ .gitignore created');
}

function showInstructions() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('           DEPLOY DOGRACY TO GITHUB');
    console.log('═════════════════════════════════════════════════════');
    console.log('');
    
    console.log('STEP 1: CREATE GITHUB REPOSITORY');
    console.log('   1. Go to https://github.com/new');
    console.log(`   2. Repository name: ${CONFIG.repoName}`);
    console.log('   3. Description: Dogracy web application');
    console.log('   4. Make it PUBLIC');
    console.log('   5. Initialize with README');
    console.log('   6. Click "Create repository"');
    console.log('');
    
    console.log('STEP 2: UPDATE CONFIGURATION');
    console.log(`   Edit deploy-github.js line 8:`);
    console.log(`   githubUsername: '${CONFIG.githubUsername}' → 'your-username'`);
    console.log('');
    
    console.log('STEP 3: UPLOAD ALL FILES');
    console.log('   1. Open your new repository');
    console.log('   2. Click "Upload files"');
    console.log('   3. Upload ALL files from this folder:');
    console.log('      - index.html');
    console.log('      - script.js');
    console.log('      - server.js');
    console.log('      - style.css');
    console.log('      - package.json');
    console.log('      - data/ folder');
    console.log('      - ngrok.exe');
    console.log('      - start-dogracy.bat');
    console.log('      - stop-dogracy.bat');
    console.log('      - own-shortener/ folder');
    console.log('      - update-bitly.js, update-url.js, etc.');
    console.log('   4. Commit changes');
    console.log('');
    
    console.log('STEP 4: ENABLE GITHUB PAGES');
    console.log('   1. Go to Settings → Pages');
    console.log('   2. Source: Deploy from a branch');
    console.log('   3. Branch: main / (root)');
    console.log('   4. Click Save');
    console.log('');
    
    console.log('STEP 5: YOUR GITHUB PAGES URL');
    console.log(`   https://${CONFIG.githubUsername}.github.io/${CONFIG.repoName}`);
    console.log('');
    
    console.log('STEP 6: UPDATE WHEN SERVER RESTARTS');
    console.log('   1. Edit files in GitHub');
    console.log('   2. Commit changes');
    console.log('   3. GitHub Pages updates automatically');
    console.log('');
    
    console.log('═════════════════════════════════════════════════════');
    console.log('✅ YOUR DOGRACY IS NOW ON GITHUB!');
    console.log('═════════════════════════════════════════════════════');
}

// Clean up unnecessary files
function cleanupFiles() {
    const filesToRemove = [
        'update-bitly.js',
        'update-domain.ps1', 
        'update-domain.py',
        'update-rebrandly.js',
        'update-tinyurl-manual.js',
        'update-url.js',
        'auto-shorten.js',
        'shortio-update.js',
        'SHORTURL-README.txt',
        'OWN-SHORTENER-README.txt',
        '.env.local'
    ];
    
    console.log('Cleaning up unnecessary files...');
    filesToRemove.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`   Removed: ${file}`);
        }
    });
    
    // Clean up own-shortener folder (keep only README)
    const ownShortenerDir = path.join(__dirname, 'own-shortener');
    if (fs.existsSync(ownShortenerDir)) {
        const files = fs.readdirSync(ownShortenerDir);
        files.forEach(file => {
            if (file !== 'README.txt') {
                fs.unlinkSync(path.join(ownShortenerDir, file));
                console.log(`   Removed: own-shortener/${file}`);
            }
        });
    }
    
    console.log('✅ Cleanup completed');
}

// Main execution
console.log('🐕 Dogracy GitHub Deployment Setup');
console.log('═══════════════════════════════════════');

// Clean up old files
cleanupFiles();

// Create GitHub repository structure
createGitignore();
createGitHubRepo();

// Show deployment instructions
showInstructions();

console.log('');
console.log('📋 NEXT STEPS:');
console.log('1. Update your GitHub username in deploy-github.js');
console.log('2. Create GitHub repository');
console.log('3. Upload all files');
console.log('4. Enable GitHub Pages');
console.log('');
console.log('✅ Setup complete! Follow steps above.');
console.log('');
