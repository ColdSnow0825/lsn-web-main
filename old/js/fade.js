document.addEventListener("DOMContentLoaded", () => {
    const hiddenItems = document.querySelectorAll(".hidden");
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target); // 显示后不再观察
        }
      });
    }, {
      threshold: 0.1 // 元素进入视口10%即触发
    });
  
    hiddenItems.forEach(el => {
      observer.observe(el);
    });
  });
  