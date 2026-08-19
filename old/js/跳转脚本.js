document.addEventListener("DOMContentLoaded", () => {
    // 页面加载后，为<body>添加.fade-in，触发淡入
    document.body.classList.add("fade-in");
  
    // 获取当前页面所有链接
    const links = document.querySelectorAll("a");
    links.forEach(link => {
      // 只有同域名、且不是锚点的链接才做动画
      // （如果你也想对外部链接做动画，可视需求修改判断条件）
      const targetHostname = new URL(link.href).hostname;
      if (targetHostname === window.location.hostname) {
        link.addEventListener("click", (e) => {
          // 若链接含有 # ，可能是同页面锚点跳转，可自行决定是否动画
          // 这里示例里跳过带 '#' 的链接
          if (link.hash) {
            return;
          }
  
          e.preventDefault(); // 阻止默认跳转
          const href = link.href; // 获取目标地址
  
          // 1) 为<body>移除.fade-in，再添加.fade，触发淡出
          document.body.classList.remove("fade-in");
          document.body.classList.add("fade");
  
          // 2) 等待动画结束后再进行跳转
          setTimeout(() => {
            window.location.href = href;
          }, 800); // 与CSS的transition 0.8s 对应
        });
      }
    });
  });
  