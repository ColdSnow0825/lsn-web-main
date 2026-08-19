# SNOW / LIU — 个人网站

刘思诺（Snow）个人网站。求职方向：**无畏契约电竞联盟运营｜队伍 / 选手管理｜赛事活动协同**。

在线地址：<https://snowl365.github.io/lsn-web/>

## 页面

| 文件 | 内容 |
| --- | --- |
| `index.html` | 首页：身份、核心优势、关键数据、无畏契约与精选项目导览 |
| `about.html` | 个人档案：基本信息、教育背景、校园经历、专业技能 |
| `valorant.html` | 无畏契约专区：玩家身份、赛事现场、玩家社群、研究与数据 |
| `projects.html` | 项目档案：6 个项目 |
| `cv.html` | 简历：工作经历时间轴 + PDF 在线预览与下载 |
| `demo/` | 设计系统 Demo 与 Style Guide（占位内容，供参考对照） |
| `old/` | 旧版网站完整备份（2026-07 改版前） |

## 目录结构

```
css/
  esports.css   设计系统（令牌 / 组件 / 动效）
  site.css      站点层样式
js/
  esports.js    交互引擎（读条、准星光标、滚动揭示、计数器、倾斜、跑马灯）
images/         图片
files/          简历与项目文档
demo/           设计 Demo + Style Guide
old/            旧版备份
```

## 设计系统 — PROTOCOL

面向电竞 / FPS 语境的深色设计系统，参考 VALORANT 官网视觉语言。

- **配色**：`#0F1923` 战术黑蓝底 · `#FF4655` 信号红 · `#00E6C3` HUD 青 · `#ECE8E1` 米白，比例 70/20/10
- **形状**：全站 `border-radius: 0`，一律用 `clip-path` 切角（按钮 10px / 卡片 26px）
- **字体**：Teko（标题）· Rajdhani（UI）· Share Tech Mono（HUD）· Noto Sans SC（中文正文）
- **动效**：`cubic-bezier(.16,1,.3,1)` 主缓动；IntersectionObserver 驱动滚动揭示；尊重系统「减少动态效果」偏好

完整规范见 `demo/styleguide.html`。

## 技术

纯静态站点，无构建步骤。Bootstrap 5.3（CDN）负责栅格与 Offcanvas / Tabs / Accordion 等组件，通过覆写 CSS 变量套上电竞皮肤；交互脚本为原生 JS，无 jQuery。

## 本地预览

```powershell
python -m http.server 5500
# 然后访问 http://localhost:5500/
```
