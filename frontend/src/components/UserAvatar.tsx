// Avatar reutilisable: affiche la photo de profil ou une initiale de secours.
type UserAvatarProps = {
  className?: string;
  fullName?: null | string;
  image?: null | string;
};

function getInitial(fullName?: null | string) {
  // Extrait l'initiale a afficher quand aucune photo n'est disponible.
  // Un S par defaut conserve un rendu stable meme sans nom renseigne.
  return fullName?.trim().slice(0, 1).toUpperCase() || "S";
}

export default function UserAvatar({ className = "", fullName, image }: UserAvatarProps) {
  // Affiche soit la photo de profil, soit un fallback textuel stylise.
  // Ce composant reste reutilisable dans la sidebar, le profil et d'autres cartes.
  if (image) {
    return (
      <img
        alt={`Photo de profil de ${fullName || "SmartEstate"}`}
        className={className}
        src={image}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center rounded-full bg-primary font-headline font-extrabold text-white ${className}`.trim()}
    >
      {getInitial(fullName)}
    </div>
  );
}
