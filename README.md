# NodeMCU IDE

A lightweight and user-friendly IDE for developing and deploying NodeMCU (ESP8266/ESP32) projects.

## Features

- Code editor with syntax highlighting for Lua and other supported languages.
- Serial communication for uploading and debugging code.
- Project management for organizing multiple scripts.
- Cross-platform support.

## Setup

### Prerequisites

- Node.js (v14 or later)
- npm (Node Package Manager)
- A NodeMCU development board (ESP8266/ESP32)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/NodemcuIDE.git
cd NodemcuIDE
```

2. Install dependencies:

```bash
npm install
```

3. Start the application:

```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`.

## Code Structure

```
NodemcuIDE/
├── src/
│   ├── components/       # Reusable UI components
│   ├── services/         # Backend communication and utilities
│   ├── styles/           # CSS and styling files
│   ├── App.js            # Main application component
│   └── index.js          # Entry point of the application
├── public/               # Static assets
├── package.json          # Project metadata and dependencies
└── README.md             # Project documentation
```

## Electron and Renderer Setup

### Setting Up Electron

1. Install Electron as a development dependency:

```bash
npm install electron --save-dev
```

2. Add a `main.js` file in the root directory for the Electron main process:

```javascript
const { app, BrowserWindow } = require("electron");

let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL("http://localhost:3000");
});
```

3. Update the `package.json` file to include a start script for Electron:

```json
"scripts": {
  "start": "react-scripts start",
  "electron": "electron ."
}
```

### Setting Up the Renderer Process

1. Ensure the `webPreferences` in `main.js` has `nodeIntegration` enabled for the renderer process.

2. Use Node.js modules in your React components as needed. For example:

```javascript
const fs = require("fs");

function ExampleComponent() {
  const readFile = () => {
    fs.readFile("example.txt", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(data);
    });
  };

  return <button onClick={readFile}>Read File</button>;
}

export default ExampleComponent;
```

3. Run the application:

```bash
npm run electron
```

## Contributing

1. Fork the repository.
2. Create a new branch:

```bash
git checkout -b feature-name
```

3. Commit your changes:

```bash
git commit -m "Add feature-name"
```

4. Push to the branch:

```bash
git push origin feature-name
```

5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
