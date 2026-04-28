import { useEffect } from "react";

export function useRevealOnScroll() {
  useEffect(() => {
    const revealElements = document.querySelectorAll<HTMLElement>(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );

    revealElements.forEach((element) => {
      element.classList.remove("is-visible");
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);
}
