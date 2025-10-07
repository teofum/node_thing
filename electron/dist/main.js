"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
let win = null;
function createWindow() {
    win = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {},
    });
    const devMode = process.env.NODE_ENV !== "production";
    const url = devMode
        ? "http://localhost:3000"
        : `file://${path_1.default.join(__dirname, ".next/server/pages/index.html")}`;
    win.loadURL(url);
    win.on("closed", () => {
        win = null;
    });
}
// Create main window on start
electron_1.app.on("ready", createWindow);
// Windows/Linux: quit when all windows are closed
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
// macOS: create a window if there are none
electron_1.app.on("activate", () => {
    if (win === null) {
        createWindow();
    }
});
//# sourceMappingURL=main.js.map