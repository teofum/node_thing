import { app, BrowserWindow } from "electron";
import { join } from "path";
import { startServer } from "next/dist/server/lib/start-server";
import { getPort } from "get-port-please";

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });
  win.on("ready-to-show", () => win?.show());

  const loadURL = async () => {
    try {
      const port = await startNextJSServer();
      console.log("Next.js server started on port:", port);
      win?.loadURL(`http://localhost:${port}`);
    } catch (error) {
      console.error("Error starting Next.js server:", error);
    }
  };
  loadURL();

  win.on("closed", () => {
    win = null;
  });
}

async function startNextJSServer() {
  try {
    const nextJSPort = await getPort({ portRange: [30_011, 50_000] });
    const webDir = join(app.getAppPath(), "app");

    await startServer({
      dir: webDir,
      isDev: false,
      hostname: "localhost",
      port: nextJSPort,
      customServer: true,
      allowRetry: false,
      keepAliveTimeout: 5000,
      minimalMode: true,
    });

    return nextJSPort;
  } catch (error) {
    console.error("Error starting Next.js server:", error);
    throw error;
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Windows/Linux: quit when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
