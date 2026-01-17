# Testing Instructions

To test the internationalization (i18n) functionality of the application, follow these steps:

## 1. Install `http-server`

If you don't have `http-server` installed, you can install it globally using npm:

```bash
npm install -g http-server
```

## 2. Build the Application

Build the application for both Arabic and English languages:

```bash
ng build --configuration=production,ar
ng build --configuration=production,en
```

This will create a `dist/dr-enam` directory containing the production-ready builds for both languages in `ar` and `en` subdirectories.

## 3. Serve the Application

The easiest way to test the language switching is to use a simple Node.js server that can direct traffic to the correct language folder.

1.  Create a file named `server.js` in the root of your project.
2.  Copy and paste the following code into `server.js`:

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8080;
const projectRoot = 'dist/dr-enam'; // Adjust this to your project's output directory

const server = http.createServer((req, res) => {
  let filePath = req.url;
  let lang = 'ar'; // Default language

  if (req.url.startsWith('/en/')) {
    lang = 'en';
    filePath = req.url.substring(3); // Remove /en
  } else if (req.url.startsWith('/ar/')) {
    lang = 'ar';
    filePath = req.url.substring(3); // Remove /ar
  }

  // If the path is a file, serve it. Otherwise, serve the index.html of the respective language.
  let fullPath = path.join(__dirname, projectRoot, lang, filePath);
  if (!fs.existsSync(fullPath) || fs.lstatSync(fullPath).isDirectory()) {
    fullPath = path.join(__dirname, projectRoot, lang, 'index.html');
  }

  fs.readFile(fullPath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log('Open http://localhost:8080/ar/ to see the Arabic version.');
  console.log('Open http://localhost:8080/en/ to see the English version.');
});
```

3.  Start the server:

```bash
node server.js
```

4.  Open your web browser and go to `http://localhost:8080`. It should show the Arabic version of the site. Click the "EN" button to switch to English. The URL will change to `http://localhost:8080/en/`, and you should see the English version.
