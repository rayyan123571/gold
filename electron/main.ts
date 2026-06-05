import { app, BrowserWindow } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null

function logMemory(label: string) {
  const usage = process.memoryUsage()
  console.log(`[MEMORY ${label}] RSS: ${Math.round(usage.rss / 1024 / 1024)}MB | Heap: ${Math.round(usage.heapUsed / 1024 / 1024)}/${Math.round(usage.heapTotal / 1024 / 1024)}MB`)
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 850,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'default',
    show: false,
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    logMemory('after-show')
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    // DevTools closed by default to save 2-4GB RAM. Press F12 to open.
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Log memory every 10s in dev
  if (process.env.VITE_DEV_SERVER_URL) {
    setInterval(() => logMemory('main-process'), 10000)
  }
}

app.whenReady().then(() => {
  logMemory('before-create')
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})