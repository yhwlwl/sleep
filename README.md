# 午休静校 — 教室倒计时锁屏

教室一体机中午 13:10-13:55 全屏倒计时画面，提醒学生回到座位保持安静。

## 版本一：Web 版（推荐）

### 部署

将 `index.html` 部署到任意静态托管服务（Vercel、GitHub Pages 等），获得一个 HTTPS 网址。

### 使用（每天中午）

在一体机上按 `Win+R`，输入：

```
msedge --kiosk https://你的域名?auto=1 --edge-kiosk-type=fullscreen
```

> 首次输入后 Win+R 会记住历史，之后只需 `Win+R` → 回车即可。

### 功能

- ✅ 纯黑背景，白色黑体字，分辨率自适应
- ✅ 大字"静" + "请同学回到座位"
- ✅ 倒计时 `HH:MM:SS` 格式，自动倒数到 13:55
- ✅ 13:55 自动关闭
- ✅ 拦截 Esc、Ctrl+W、F11 等快捷键
- ✅ 退出全屏自动弹回
- ✅ 关闭窗口前弹出确认框
- ⚠️ Alt+F4 无法完全阻止（系统级），会弹确认框

---

## 版本二：EXE 桌面版（更强锁定）

### 功能

在 Web 版基础上，彻底封死所有系统快捷键：

- ❌ Alt+F4 → 被封死
- ❌ Win 键 → 被封死
- ❌ Alt+Tab → 被封死
- ❌ Ctrl+Alt+Del → 被拦截
- ✅ 老师退出：按 `Ctrl+Shift+Q` → 输入密码 `0000` → 退出

### 使用

1. 将 `午休静校-便携版` 文件夹放到 U 盘（或一体机任意位置）
2. 双击 `午休静校.exe` → 自动全屏锁屏，倒计时开始
3. 13:55 自动退出

### 老师中途退出

按 `Ctrl+Shift+Q` → 输入密码 `0000` → 回车。

---

## 构建 EXE

```bash
npm install
npx @electron/packager . "午休静校" --platform=win32 --arch=x64 --out=release --overwrite
```

输出在 `release/午休静校-win32-x64/` 文件夹。

---

## 密码修改

- Web 版：编辑 `index.html`，修改 `TEACHER_EXIT_PASSWORD` 变量
- EXE 版：编辑 `main.js`，修改 `TEACHER_EXIT_PASSWORD` 常量

默认密码：`0000`

---

## 技术栈

- Web 版：纯 HTML/CSS/JS（零依赖）
- EXE 版：Electron + electron-builder（便携 EXE，无需安装）
