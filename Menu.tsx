import React, { ReactNode } from "react";
import clsx from "clsx";

export interface HeaderProps {
  children: ReactNode;
  variant?: "default" | "dark" | "custom";
  className?: string;
}

const Header: React.FC<HeaderProps> & {
  LinkGroup: React.FC<{ children: ReactNode }>;
  ActionGroup: React.FC<{ children: ReactNode }>;
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

export default Header;