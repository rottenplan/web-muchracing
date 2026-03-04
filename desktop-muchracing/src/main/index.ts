import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import icon from '../../resources/icon.png?asset'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'

// Configure FFmpeg path
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic)
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC handlers for File Selection
  ipcMain.handle('dialog:openFile', async (_, options) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(options)
    return canceled ? null : filePaths[0]
  })

  // IPC handler to read file content (for Telemetry JSON)
  ipcMain.handle('fs:readFile', async (_, filePath) => {
    try {
      return fs.readFileSync(filePath, 'utf-8')
    } catch (e: any) {
      return null
    }
  })

  createWindow()

  // --- Video Export Engine ---
  let ffmpegProcess: any = null

  ipcMain.handle('export:start', async (_, options) => {
    let { outputPath, width, height, fps, hasTransparentBg } = options

    // Force .mov for transparency if .mp4 was selected (standard pro workflow)
    if (hasTransparentBg && outputPath.endsWith('.mp4')) {
      outputPath = outputPath.replace('.mp4', '.mov')
      console.log('Forcing .mov for transparent export:', outputPath)
    }

    return new Promise((resolve, reject) => {
      let command = ffmpeg()
        .input('pipe:0')
        .inputFPS(fps)
        .inputFormat('image2pipe')
        .inputOptions([
          '-vcodec', 'png' // Explicitly tell FFmpeg the input is PNG stream
        ])
        .videoCodec(hasTransparentBg ? 'png' : 'libx264')
        .on('start', (commandLine) => {
          console.log('FFmpeg started: ' + commandLine)
          ffmpegProcess = command // Assign here to ensure it's the living command
          resolve(true)
        })
        .on('stderr', (stderrLine) => {
          console.log('FFmpeg stderr: ' + stderrLine)
        })
        .on('error', (err, _stdout, stderr) => {
          console.error('FFmpeg error:', err.message)
          console.error('FFmpeg stderr:', stderr)
          ffmpegProcess = null
          reject(new Error(`FFmpeg failed: ${err.message}`))
        })
        .on('end', () => {
          console.log('FFmpeg finished')
          ffmpegProcess = null
        });

      if (width && height) {
        command = command.size(`${width}x${height}`)
      }

      command.outputOptions([
        '-pix_fmt', hasTransparentBg ? 'rgba' : 'yuv420p',
        '-crf', '18'
      ]).save(outputPath)
    })
  })

  ipcMain.handle('dialog:saveFile', async (_, options) => {
    const { canceled, filePath } = await dialog.showSaveDialog(options)
    return canceled ? null : filePath
  })

  ipcMain.handle('export:frame', async (_, frameData) => {
    if (ffmpegProcess && ffmpegProcess.ffmpegProc && ffmpegProcess.ffmpegProc.stdin) {
      const buffer = Buffer.from(frameData.split(',')[1], 'base64')
      ffmpegProcess.ffmpegProc.stdin.write(buffer)
      return true
    }
    return false
  })

  ipcMain.handle('export:finish', async () => {
    if (ffmpegProcess && ffmpegProcess.ffmpegProc && ffmpegProcess.ffmpegProc.stdin) {
      ffmpegProcess.ffmpegProc.stdin.end()
      ffmpegProcess = null
      return true
    }
    return false
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
