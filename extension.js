const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "extension.createMVCStructure",
    async function () {
      const rootPath = vscode.workspace.rootPath;

      if (!rootPath) {
        vscode.window.showErrorMessage("Please open a project folder first.");
        return;
      }

      // Prompt for module type
      const moduleType = await vscode.window.showQuickPick(
        ["CommonJS", 'ESM (type="module")'],
        { placeHolder: "Select your Node.js module system" }
      );
      if (!moduleType) return;

      // Prompt for database type
      const dbType = await vscode.window.showQuickPick(
        ["MongoDB", "MySQL", "PostgreSQL"],
        { placeHolder: "Select a database for your project" }
      );
      if (!dbType) return;

      // Prompt for database URL
      const dbUrl = await vscode.window.showInputBox({
        prompt: `Enter your ${dbType} connection URL`,
      });
      if (!dbUrl) return;

      // For PostgreSQL, prompt for pg-host
      let pgHost = "";
      if (dbType === "PostgreSQL") {
        pgHost = await vscode.window.showInputBox({
          prompt: "Enter your PostgreSQL host (pg-host)",
        });
        if (!pgHost) return;
      }

      // Define the folders to be created
      const folders = [
        "controllers",
        "models",
        "views",
        "routes",
        "config",
        "middlewares",
        "public",
        "services",
        "utils",
      ];

      // Create the folders
      folders.forEach((folder) => {
        const folderPath = path.join(rootPath, folder);
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath);
        }
      });

      // Create a .env file with DB URL and pg-host if needed
      const envFilePath = path.join(rootPath, ".env");
      if (!fs.existsSync(envFilePath)) {
        let envContent = `PORT=3000\n`;
        if (dbType === "MongoDB") {
          envContent += `MONGO_URI=${dbUrl}\n`;
        } else if (dbType === "MySQL") {
          envContent += `MYSQL_URL=${dbUrl}\n`;
        } else if (dbType === "PostgreSQL") {
          envContent += `PG_URL=${dbUrl}\nPG_HOST=${pgHost}\n`;
        }
        fs.writeFileSync(envFilePath, envContent);
      }

      // Create a basic server file (index.js or index.mjs)
      const isESM = moduleType.startsWith("ESM");
      const appFileName = isESM ? "index.mjs" : "index.js";
      const appFilePath = path.join(rootPath, appFileName);
      if (!fs.existsSync(appFilePath)) {
        let importDb = isESM
          ? `import './config/db.${isESM ? "mjs" : "js"}';\n`
          : `require('./config/db');\n`;
        let serverCode = isESM
          ? `// Main server entry (ESM)\nimport express from 'express';\nimport dotenv from 'dotenv';\n${importDb}\ndotenv.config();\nconst app = express();\nconst port = process.env.PORT || 3000;\n\n// Root route\napp.get('/', (req, res) => res.send('Server is running!'));\n\n// Start server\napp.listen(port, () => console.log('Server started on port ' + port));\n`
          : `// Main server entry (CommonJS)\nconst express = require('express');\nrequire('dotenv').config();\n${importDb}const app = express();\nconst port = process.env.PORT || 3000;\n\n// Root route\napp.get('/', (req, res) => res.send('Server is running!'));\n\n// Start server\napp.listen(port, () => console.log('Server started on port ' + port));\n`;
        fs.writeFileSync(appFilePath, serverCode);
      }

      // Create a database connection file in config/db.js or db.mjs
      const configDir = path.join(rootPath, "config");
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir);
      }
      const dbFileName = isESM ? "db.mjs" : "db.js";
      const dbFilePath = path.join(configDir, dbFileName);
      if (!fs.existsSync(dbFilePath)) {
        let dbCode = "";
        if (dbType === "MongoDB") {
          dbCode = isESM
            ? `// MongoDB connection using Mongoose (ESM)\nimport mongoose from 'mongoose';\nimport dotenv from 'dotenv';\ndotenv.config();\nconst uri = process.env.MONGO_URI;\nmongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })\n    .then(() => console.log('MongoDB connected'))\n    .catch(err => console.error('MongoDB connection error:', err));\n`
            : `// MongoDB connection using Mongoose (CommonJS)\nconst mongoose = require('mongoose');\nconst uri = process.env.MONGO_URI;\nmongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })\n    .then(() => console.log('MongoDB connected'))\n    .catch(err => console.error('MongoDB connection error:', err));\n`;
        } else if (dbType === "MySQL") {
          dbCode = isESM
            ? `// MySQL connection using mysql2 (ESM)\nimport mysql from 'mysql2';\nconst url = process.env.MYSQL_URL;\nconst connection = mysql.createConnection(url);\nconnection.connect(err => {\n    if (err) {\n        console.error('MySQL connection error:', err);\n    } else {\n        console.log('MySQL connected');\n    }\n});\n`
            : `// MySQL connection using mysql2 (CommonJS)\nconst mysql = require('mysql2');\nconst url = process.env.MYSQL_URL;\nconst connection = mysql.createConnection(url);\nconnection.connect(err => {\n    if (err) {\n        console.error('MySQL connection error:', err);\n    } else {\n        console.log('MySQL connected');\n    }\n});\n`;
        } else if (dbType === "PostgreSQL") {
          dbCode = isESM
            ? `// PostgreSQL connection using pg (ESM)\nimport pkg from 'pg';\nconst { Client } = pkg;\nconst url = process.env.PG_URL;\nconst host = process.env.PG_HOST;\nconst client = new Client({ connectionString: url, host });\nclient.connect(err => {\n    if (err) {\n        console.error('PostgreSQL connection error:', err);\n    } else {\n        console.log('PostgreSQL connected');\n    }\n});\n`
            : `// PostgreSQL connection using pg (CommonJS)\nconst { Client } = require('pg');\nconst url = process.env.PG_URL;\nconst host = process.env.PG_HOST;\nconst client = new Client({ connectionString: url, host });\nclient.connect(err => {\n    if (err) {\n        console.error('PostgreSQL connection error:', err);\n    } else {\n        console.log('PostgreSQL connected');\n    }\n});\n`;
        }
        fs.writeFileSync(dbFilePath, dbCode);
      }

      // Create or update package.json with scripts, dependencies, and type
      const packageJsonPath = path.join(rootPath, "package.json");
      let dependencies = {
        express: "^4.18.2",
        dotenv: "^16.3.1",
      };
      if (dbType === "MongoDB") {
        dependencies["mongoose"] = "^7.6.3";
      } else if (dbType === "MySQL") {
        dependencies["mysql2"] = "^3.9.7";
      } else if (dbType === "PostgreSQL") {
        dependencies["pg"] = "^8.11.3";
      }
      const packageJson = {
        name: "mvc-backend",
        version: "1.0.0",
        main: appFileName,
        scripts: {
          dev: isESM
            ? `nodemon --watch . --exec node --experimental-specifier-resolution=node ${appFileName}`
            : "nodemon index.js",
          start: isESM
            ? `node --experimental-specifier-resolution=node ${appFileName}`
            : "node index.js",
        },
        dependencies,
        devDependencies: {
          nodemon: "^3.0.1",
        },
        ...(isESM ? { type: "module" } : {}),
      };
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      vscode.window.showInformationMessage(
        "Professional MVC structure, .env, server, and DB connection created!"
      );
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
