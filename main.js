const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

// ============ 配置 ============
const TEACHER_EXIT_PASSWORD = '0000';
const TARGET_HOUR = 13;
const TARGET_MINUTE = 55;

let mainWindow = null;
let isLocked = false;

// ============ 创建窗口 ============
function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    kiosk: true,                    // Windows Kiosk 模式：禁用 Win键、Alt+Tab、任务栏等
    alwaysOnTop: true,              // 始终置顶
    frame: false,                   // 无边框
    resizable: false,
    skipTaskbar: true,              // 不在任务栏显示
    autoHideMenuBar: true,
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,       // 安全：隔离渲染进程
      nodeIntegration: false,       // 安全：不暴露 Node
      devTools: false,              // 禁用开发者工具
    },
  });

  // 加载本地 HTML
  mainWindow.loadFile('index.html');

  // 禁止打开新窗口（如 window.open、target="_blank"）
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  // 防止 ESC 退出全屏
  mainWindow.on('leave-full-screen', () => {
    if (isLocked) {
      mainWindow.setFullScreen(true);
    }
  });

  // 防止窗口失去全屏
  mainWindow.on('blur', () => {
    if (isLocked) {
      mainWindow.focus();
      mainWindow.setAlwaysOnTop(true);
    }
  });

  // 拦截关闭事件
  mainWindow.on('close', (e) => {
    if (isLocked) {
      e.preventDefault();
      // 通知渲染进程显示密码框
      mainWindow.webContents.send('show-password-dialog');
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ============ 全局快捷键拦截 ============
function registerLockShortcuts() {
  // 核心拦截（必须成功，否则锁屏有漏洞）
  const criticalShortcuts = [
    { key: 'Alt+F4',               handler: () => { if (isLocked) mainWindow.webContents.send('show-password-dialog'); } },
    { key: 'CommandOrControl+Shift+Q', handler: () => { if (isLocked) mainWindow.webContents.send('show-password-dialog'); } },
  ];

  // 增强拦截（Kiosk 模式已处理，这里双保险；失败不影响）
  const extraShortcuts = [
    'Super',
    'CommandOrControl+Shift+Escape',
    'Alt+Space',
    'Alt+Escape',
  ];

  for (const sc of criticalShortcuts) {
    try {
      globalShortcut.register(sc.key, sc.handler);
      console.log(`[Lock] Registered: ${sc.key}`);
    } catch (err) {
      console.error(`[Lock] Failed to register ${sc.key}:`, err.message);
    }
  }

  for (const key of extraShortcuts) {
    try {
      globalShortcut.register(key, () => {});
    } catch (_) {
      // Kiosk 模式已拦截，注册失败无所谓
    }
  }

  isLocked = true;
  console.log('[Lock] All shortcuts registered, system locked');
}

function unregisterAllShortcuts() {
  globalShortcut.unregisterAll();
  isLocked = false;
}

// ============ IPC 通信 ============
// 渲染进程通知：倒计时结束，正常关闭
ipcMain.on('close-app', () => {
  unregisterAllShortcuts();
  if (mainWindow) {
    mainWindow.close();
  }
});

// 渲染进程通知：老师输入正确密码，解锁关闭
ipcMain.on('unlock-and-close', () => {
  unregisterAllShortcuts();
  if (mainWindow) {
    // 短暂延迟让渲染进程显示"已解锁"
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.close();
      }
    }, 500);
  }
});

// 渲染进程通知：密码验证
ipcMain.on('verify-password', (event, password) => {
  if (password === TEACHER_EXIT_PASSWORD) {
    unregisterAllShortcuts();
    event.reply('password-result', true);
  } else {
    event.reply('password-result', false);
  }
});

// ============ 应用生命周期 ============
app.whenReady().then(() => {
  createWindow();
  registerLockShortcuts();

  // 窗口失去焦点时重新抢回（双保险）
  setInterval(() => {
    if (isLocked && mainWindow) {
      if (!mainWindow.isFocused()) {
        mainWindow.focus();
      }
      if (!mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(true);
      }
      if (!mainWindow.isAlwaysOnTop()) {
        mainWindow.setAlwaysOnTop(true);
      }
    }
  }, 1000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  unregisterAllShortcuts();
  app.quit();
});

app.on('will-quit', () => {
  unregisterAllShortcuts();
});

// 防止第二个实例（可选，避免多个锁屏窗口）
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
