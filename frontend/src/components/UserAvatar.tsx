type UserAvatarProps = {
  className?: string;
  fullName?: null | string;
  image?: null | string;
};

function getInitial(fullName?: null | string) {
  return fullName?.trim().slice(0, 1).toUpperCase() || "S";
}

export default function UserAvatar({ className = "", fullName, image }: UserAvatarProps) {
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
