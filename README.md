# MVC Folder Structure Generator for VS Code

A Visual Studio Code extension that automatically generates a professional MVC folder structure for Node.js projects. Choose your preferred module system (CommonJS or ESM), select your database (MongoDB, MySQL, or PostgreSQL), and get started with a ready-to-use backend project in seconds!

## Features
- Quickly scaffold a modern MVC backend structure
- Choose between CommonJS or ESM (type="module")
- Database support: MongoDB, MySQL, PostgreSQL (with .env and connection setup)
- Professional, commented starter code using arrow functions
- Generates .env, LICENSE.txt, and package.json with best practices
- Custom project icon (folder.png)

## Installation
1. Download or clone this repository.
2. In VS Code, go to the Extensions view (Ctrl+Shift+X).
3. Click the three dots (...) > "Install from VSIX..." and select the `mvcfolderstructure-*.vsix` file, or search for "MVC Folder Structure" in the VS Code Marketplace (after publishing).

## Usage
1. Open a Node.js project folder in VS Code.
2. Open the Command Palette (`Ctrl+Shift+P`).
3. Type `Create MVC Folder Structure` and select the command.
4. Follow the prompts:
   - Select your module system (CommonJS or ESM)
   - Select your database (MongoDB, MySQL, PostgreSQL)
   - Enter your database connection URL
   - (For PostgreSQL) Enter your pg-host
5. The extension will generate:
   - Standard MVC folders: controllers, models, views, routes, config, middlewares, public, services, utils
   - A .env file with your DB connection
   - A LICENSE.txt (MIT)
   - A package.json with scripts, dependencies, repository, license, and icon
   - A starter server file (index.js or index.mjs) and DB connection file

## Configuration
- **Module System:** Choose between CommonJS or ESM (type="module")
- **Database:** MongoDB, MySQL, or PostgreSQL (with pg-host support)
- **.env:** Automatically generated with your DB credentials
- **package.json:** Includes repository, license, and icon fields

## Contributing
Contributions are welcome! Please open issues or pull requests on [GitHub](https://github.com/Yash-oza-24/mvc-extension).

## License
This project is licensed under the MIT License. See [LICENSE.txt](./LICENSE.txt) for details.

## Author & Contact
Created by [Yash Oza](https://github.com/Yash-oza-24).

For questions or support, open an issue on GitHub or contact via the repository.
