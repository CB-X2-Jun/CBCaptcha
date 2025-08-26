# CBCaptcha Demo

CBCaptcha 是一个简易的人机验证 Demo，灵感来自 hCaptcha / reCaptcha / Cloudflare Turnstile。  
此 Demo 前端实现，**仅供展示 UI 与触发逻辑**，不具备真实的安全防护能力。  

### 功能特性
- 任意页面引入 `cbcaptcha.js` 即可使用
- 用户点击链接时 **60% 概率** 触发验证
- 验证界面全屏白色，仅居中显示验证区域
- 验证方式：
  - 80% 概率为「点击方框」  
  - 20% 概率为「滑动条」
- 多语言支持：简体中文 / English（通过复选框切换）
- 验证成功后短时间免验证（默认 2 分钟）

### 部署方法
1. Fork 或 clone 本仓库  
2. 推送到 GitHub  
3. 在 Settings → Pages 启用 GitHub Pages  
   或者直接用 Netlify / Vercel 部署  

### 使用方法
在任意页面 `<head>` 或 `<body>` 末尾添加：
```html
<link rel="stylesheet" href="https://cb-x2-jun.github.io/CBCaptcha/cbcaptcha.css">
<script src="https://cb-x2-jun.github.io/CBCaptcha/cbcaptcha.js"></script>
```
然后页面中用户点击 `<a>` 链接，就有概率触发 CBCaptcha。
