import { app, BrowserWindow } from "electron";
import path from "path";

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {},
  });

  const devMode = process.env.NODE_ENV !== "production";
  const url = devMode
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, ".next/server/pages/index.html")}`;

  win.loadURL(url);

  win.on("closed", () => {
    win = null;
  });
}

// Create main window on start
app.on("ready", createWindow);

// Windows/Linux: quit when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// macOS: create a window if there are none
app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});
