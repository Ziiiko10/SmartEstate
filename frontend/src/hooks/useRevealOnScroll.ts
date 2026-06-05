// Hook d'animation au scroll pour reveler progressivement certains blocs.
// Les elements cibles doivent simplement porter la classe CSS `.reveal`.
import { useEffect } from "react";

export function useRevealOnScroll() {
  // Observe les elements a reveler puis ajoute la classe visible au bon moment.
  // Chaque element n'est anime qu'une seule fois pour limiter le travail du navigateur.
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
