const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.createMVCStructure', async function () {
        const rootPath = vscode.workspace.rootPath;

        if (!rootPath) {
            vscode.window.showErrorMessage('Please open a project folder first.');
            return;
        }

        // Prompt for database type
        const dbType = await vscode.window.showQuickPick(
            ['MongoDB', 'MySQL', 'PostgreSQL'],
            { placeHolder: 'Select a database for your project' }
        );
        if (!dbType) return;

        // Prompt for database URL
        const dbUrl = await vscode.window.showInputBox({ prompt: `Enter your ${dbType} connection URL` });
        if (!dbUrl) return;

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

        // Create a .env file with DB URL
        const envFilePath = path.join(rootPath, '.env');
        if (!fs.existsSync(envFilePath)) {
            let envContent = `PORT=3000\n`;
            if (dbType === 'MongoDB') {
                envContent += `MONGO_URI=${dbUrl}\n`;
            } else if (dbType === 'MySQL') {
                envContent += `MYSQL_URL=${dbUrl}\n`;
            } else if (dbType === 'PostgreSQL') {
                envContent += `PG_URL=${dbUrl}\n`;
            }
            fs.writeFileSync(envFilePath, envContent);
        }

        // Create a basic index.js server file
        const appFilePath = path.join(rootPath, 'index.js');
        if (!fs.existsSync(appFilePath)) {
            let importDb = `require('./config/db');\n`;
            let serverCode =
                `const express = require('express');\n` +
                `require('dotenv').config();\n` +
                importDb +
                `const app = express();\n` +
                `const port = process.env.PORT || 3000;\n\n` +
                `app.get('/', (req, res) => {\n    res.send('Server is running!');\n});\n\n` +
                `app.listen(port, () => {\n    console.log('Server started on port ' + port);\n});\n`;
            fs.writeFileSync(appFilePath, serverCode);
        }

        // Create a database connection file in config/db.js
        const configDir = path.join(rootPath, 'config');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir);
        }
        const dbFilePath = path.join(configDir, 'db.js');
        if (!fs.existsSync(dbFilePath)) {
            let dbCode = '';
            if (dbType === 'MongoDB') {
                dbCode =
                    `const mongoose = require('mongoose');\n` +
                    `const uri = process.env.MONGO_URI;\n` +
                    `mongoose.connect(uri, {\n    useNewUrlParser: true,\n    useUnifiedTopology: true\n})\n.then(() => console.log('MongoDB connected'))\n.catch(err => console.error('MongoDB connection error:', err));\n`;
            } else if (dbType === 'MySQL') {
                dbCode =
                    `const mysql = require('mysql2');\n` +
                    `const url = process.env.MYSQL_URL;\n` +
                    `const connection = mysql.createConnection(url);\n` +
                    `connection.connect(err => {\n` +
                    `  if (err) {\n    console.error('MySQL connection error:', err);\n  } else {\n    console.log('MySQL connected');\n  }\n});\n`;
            } else if (dbType === 'PostgreSQL') {
                dbCode =
                    `const { Client } = require('pg');\n` +
                    `const url = process.env.PG_URL;\n` +
                    `const client = new Client({ connectionString: url });\n` +
                    `client.connect(err => {\n` +
                    `  if (err) {\n    console.error('PostgreSQL connection error:', err);\n  } else {\n    console.log('PostgreSQL connected');\n  }\n});\n`;
            }
            fs.writeFileSync(dbFilePath, dbCode);
        }

        // Create a package.json file with scripts and dependencies
        const packageJsonPath = path.join(rootPath, 'package.json');
        let dependencies = {
            "express": "^4.18.2",
            "dotenv": "^16.3.1"
        };
        if (dbType === 'MongoDB') {
            dependencies["mongoose"] = "^7.6.3";
        } else if (dbType === 'MySQL') {
            dependencies["mysql2"] = "^3.9.7";
        } else if (dbType === 'PostgreSQL') {
            dependencies["pg"] = "^8.11.3";
        }
        const packageJson = {
            name: "mvc-backend",
            version: "1.0.0",
            main: "index.js",
            scripts: {
                dev: "nodemon index.js",
                start: "node index.js"
            },
            dependencies,
            devDependencies: {
                "nodemon": "^3.0.1"
            }
        };
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

        vscode.window.showInformationMessage('Folders, .env, index.js, and DB connection file created!');
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
