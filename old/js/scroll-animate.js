document.addEventListener("DOMContentLoaded", () => {
    // 使用IntersectionObserver监听 .hidden 元素
    const hiddenElements = document.querySelectorAll(".hidden");
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          // 如果元素进入视口，则添加.show触发动画
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2 // 元素进入20%区域时触发
    });
  
    hiddenElements.forEach(el => {
      observer.observe(el);
    });
  });
  