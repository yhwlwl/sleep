# 午休静校（noon-lock）

> 面向教室大屏午休场景的简洁倒计时工具，提供 Web 与桌面两种使用方式。
>
> A minimal classroom rest timer for large displays.

## Project Status

- 状态：`Maintained` · 小而实用的工具

## 这是什么

教室一体机在午休时段显示全屏倒计时画面，提醒同学回到座位、保持安静。界面只有大字"静"与倒计时，低干扰、适合远距离观看。

## 两种使用方式

### Web 版（推荐）

将 `index.html` 部署到任意静态托管（Vercel、GitHub Pages 等），然后在教室一体机上以全屏/信息亭模式打开：

```text
msedge --kiosk https://你的域名?auto=1 --edge-kiosk-type=fullscreen
```

### 桌面版（Electron）

```bash
npm install
npm run dist:portable   # 生成 noon-lock.exe 便携版
```

桌面版提供系统级锁定快捷键与教师退出保护，适合无人值守场景。

## 功能

- 纯黑背景、白色大字，分辨率自适应；
- 大字"静" + "请同学回到座位"提示；
- `HH:MM:SS` 倒计时，自动倒数到午休结束时间；
- 预倒计时模式（默认目标 13:10）：点击屏幕开始，进入主倒计时（默认目标 13:55；时间常量可在页面代码中调整）；
- 结束提示与返回机制；
- 桌面版：注册锁定快捷键（如 Alt+F4、Ctrl+Shift+Q 等），防止学生退出全屏；教师输入退出密码后解锁关闭；
- 支持键盘、鼠标与触摸操作。

## 安全说明

桌面版的退出保护依赖预设的教师密码。**正式部署前应检查并修改退出保护设置**，不要使用默认值。

## 技术实现

- Web 版：原生 HTML/CSS/JavaScript 单文件；
- 桌面版：Electron + electron-builder（Windows 便携版）。

## 当前限制

- 时间参数以页面内配置为准（以代码实际实现为准）；
- 桌面版密码保护属于轻量使用场景，不应视为系统级安全方案。
