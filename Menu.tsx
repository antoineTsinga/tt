const Header: React.FC<HeaderProps> & {
  LinkGroup: React.FC<{ children: ReactNode }>;
  ActionGroup: React.FC<{ children: ReactNode }>;
  SearchBar: React.FC<{ placeholder?: string; onSearch?: (query: string) => void }>;
} = ({ children, variant = "default", className }) => {
  return (
    <header
      className={clsx(
        "flex items-center justify-between px-6 py-4 shadow-md",
        variant === "dark" && "bg-gray-900 text-white",
        variant === "custom" && "bg-blue-500 text-white",
        className
      )}
    >
      {children}
    </header>
  );
};

// Composant pour les liens de navigation
Header.LinkGroup = ({ children }) => (
  <nav className="hidden md:flex gap-4">{children}</nav>
);

// Composant pour les actions (ex: icônes, boutons, avatar)
Header.ActionGroup = ({ children }) => (
  <div className="flex items-center gap-4">{children}</div>
);

// Composant pour la barre de recherche
Header.SearchBar = ({ placeholder = "Rechercher...", onSearch }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(e.currentTarget.value);
    }
  };

  return (
    <div className="relative w-64">
      <input
        type="text"
        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default Header;