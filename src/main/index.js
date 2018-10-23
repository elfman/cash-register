import { app, ipcMain, BrowserWindow } from 'electron' // eslint-disable-line

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\') // eslint-disable-line
}

let mainWindow;
let printWindow;
const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080'
  : `file://${__dirname}/index.html`;

function createPrintWindow() {
  printWindow = new BrowserWindow({
    width: 320,
    height: 400,
    useContentSize: true,
    // show: false,
  });
  printWindow.loadURL(`file://${__static}/print-template.html`);
  printWindow.on('closed', () => {
    printWindow = null;
  });
}

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 800,
    useContentSize: true,
    width: 1300,
  });

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  createPrintWindow();
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('get-printers', (event) => {
  const printers = printWindow.webContents.getPrinters();
  event.sender.send('printer-list', printers);
});

ipcMain.on('fill-completed', () => {
  printWindow.webContents.print({
    silent: true,
    deviceName: 'pdfFactory Pro',
    pageSize: { width: 100, height: 100 },
  });
});

ipcMain.on('print-order', (event, goods) => {
  printWindow.webContents.send('fill-order', goods);
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
