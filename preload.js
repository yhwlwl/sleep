const { contextBridge, ipcRenderer } = require('electron');

// 安全地向渲染进程暴露 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 倒计时结束 → 通知主进程关闭
  closeApp: () => {
    ipcRenderer.send('close-app');
  },

  // 老师输入密码后 → 通知主进程解锁并关闭
  unlockAndClose: () => {
    ipcRenderer.send('unlock-and-close');
  },

  // 验证密码（同步方式）
  verifyPassword: (password) => {
    return new Promise((resolve) => {
      ipcRenderer.once('password-result', (_event, result) => {
        resolve(result);
      });
      ipcRenderer.send('verify-password', password);
    });
  },

  // 监听主进程要求显示密码对话框
  onShowPasswordDialog: (callback) => {
    ipcRenderer.on('show-password-dialog', () => {
      callback();
    });
  },

  // 移除监听
  removeShowPasswordDialogListener: () => {
    ipcRenderer.removeAllListeners('show-password-dialog');
  },
});
