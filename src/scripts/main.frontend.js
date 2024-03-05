import "/src/styles/base.css";
import "/src/styles/hero.scss";
import "/src/styles/index.scss";
import "/src/styles/tailwind.css";
import "/src/styles/responsive.scss";

// Keep scroll position between page in navigation for mobile
const sidebar = document.querySelector("[data-navigation]");

const scrollLeft = localStorage.getItem("sidebar-scroll");
if (scrollLeft !== null) {
    sidebar.scrollLeft = Number(scrollLeft);
}

window.addEventListener("beforeunload", () => {
    localStorage.setItem("sidebar-scroll", sidebar.scrollLeft);
});
