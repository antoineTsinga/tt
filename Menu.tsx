import { useState, ReactNode } from "react";

interface MenuProps {
  children: ReactNode;
}

const Menu = ({ children }: MenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-800 p-4">
      {/* Bouton pour mobile */}
      <div className="md:hidden flex justify-between items-center">
        <span className="text-white text-xl font-bold">Logo</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white focus:outline-none"
        >
          {isOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Contenu du menu (items passés en children) */}
      <ul className={`md:flex md:space-x-4 ${isOpen ? "block" : "hidden"} md:block`}>
        {children}
      </ul>
    </nav>
  );
};

interface MenuItemProps {
  href: string;
  children: ReactNode;
}

const MenuItem = ({ href, children }: MenuItemProps) => (
  <li>
    <a href={href} className="block px-4 py-2 text-white hover:bg-gray-700 rounded">
      {children}
    </a>
  </li>
);

export { Menu, MenuItem };