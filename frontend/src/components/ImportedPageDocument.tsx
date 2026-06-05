// Wrapper commun pour les pages importees: applique le style, le titre et les actions prototype.
import type { PropsWithChildren } from "react";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { handleDocumentAction } from "../lib/documentActions";

type ImportedPageDocumentProps = PropsWithChildren<{
  bodyClassName?: string;
  styles?: string;
  title: string;
}>;

export default function ImportedPageDocument({
  bodyClassName,
  children,
  styles,
  title,
}: ImportedPageDocumentProps) {
  // Enveloppe une page importee avec son style, son titre et ses actions prototype.
  // Le composant intercepte certains clics pour rejouer des comportements applicatifs.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

  useEffect(() => {
    // Met a jour le titre du document et remonte la page en haut au montage.
    // Cela reproduit un comportement classique de changement d'ecran.
    document.title = title;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [title]);

  useEffect(() => {
    // Intercepte certains clics dans le shell pour activer les actions documentaires.
    // Les liens et boutons reels non prototypes restent laisses tranquilles.
    const shell = shellRef.current;
    if (!shell) {
      return;
    }
    const currentShell = shell;

    function onClick(event: MouseEvent) {
      // Detecte le meilleur element interactif cible puis delegue l'action correspondante.
      // Si une action prototype est geree, le clic natif est annule.
      const target = event.target as HTMLElement | null;
      const trigger = target?.closest<HTMLElement>("a, button, .cursor-pointer");
      if (!trigger || !currentShell.contains(trigger)) {
        return;
      }

      if (trigger.dataset.disablePrototypeActions === "true") {
        return;
      }

      if (trigger instanceof HTMLButtonElement) {
        const type = trigger.getAttribute("type");
        if (trigger.form && (type === null || type === "submit")) {
          return;
        }
      }

      if (trigger instanceof HTMLAnchorElement) {
        const href = trigger.getAttribute("href");
        if (href && !href.startsWith("#")) {
          return;
        }
      }

      if (
        handleDocumentAction(trigger, {
          currentPath: location.pathname,
          isAuthenticated,
          logout,
          navigate,
          userRole: user?.role,
        })
      ) {
        event.preventDefault();
      }
    }

    currentShell.addEventListener("click", onClick);
    return () => {
      currentShell.removeEventListener("click", onClick);
    };
  }, [isAuthenticated, location.pathname, logout, navigate, user?.role]);

  return (
    <>
      {styles ? <style>{styles}</style> : null}
      <div
        ref={shellRef}
        className={["page-document-shell", bodyClassName].filter(Boolean).join(" ")}
      >
        {children}
      </div>
    </>
  );
}
