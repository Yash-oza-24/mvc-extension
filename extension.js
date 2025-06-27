const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.createMVCStructure', function () {
        const rootPath = vscode.workspace.rootPath;

        if (!rootPath) {
            vscode.window.showErrorMessage('Please open a project folder first.');
            return;
        }

        // Define the folders to be created
        const folders = [
            'controllers',
            'models',
            'views',
            'routes',
            'config',
            'middlewares',
            'public',
            'services',
            'utils',
        ];

        // Create the folders
        folders.forEach(folder => {
            const folderPath = path.join(rootPath, folder);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }
        });

        // Create a basic .env file
        const envFilePath = path.join(rootPath, '.env');
        if (!fs.existsSync(envFilePath)) {
            fs.writeFileSync(envFilePath, 'PORT=3000\n');
        }

        // Create a basic index.js server file
        const appFilePath = path.join(rootPath, 'index.js');
        if (!fs.existsSync(appFilePath)) {
            fs.writeFileSync(
                appFilePath,
                `const express = require('express');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.listen(port, () => {
    console.log(\`Server started on port \${port}\`);
});
`
            );
        }

        // Create a package.json file with scripts and dependencies
        const packageJsonPath = path.join(rootPath, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            const packageJson = {
                name: "mvc-backend",
                version: "1.0.0",
                main: "index.js",
                scripts: {
                    dev: "nodemon index.js",
                    start: "node index.js"
                },
                dependencies: {
                    "express": "^4.18.2",
                    "dotenv": "^16.3.1"
                },
                devDependencies: {
                    "nodemon": "^3.0.1"
                }
            };
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        }

        vscode.window.showInformationMessage('MVC folder struc  ture and basic server created! Run "npm install" then "npm run dev" to start.');
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
