import React, { useState, useEffect } from "react";
import {
  HomeIcon,
  ChartBarIcon,
  CogIcon,
  UserIcon,
  ChevronDownIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

interface MenuItem {
  label: string;
  href?: string;
  icon?: string;
  children?: MenuItem[];
}

interface SideMenuProps {
  menuData: MenuItem[];
}

const iconMap: { [key: string]: React.ReactNode } = {
  home: <HomeIcon className="h-6 w-6" />,
  "chart-bar": <ChartBarIcon className="h-6 w-6" />,
  user: <UserIcon className="h-6 w-6" />,
  settings: <CogIcon className="h-6 w-6" />,
};

const SideMenuDynamic: React.FC<SideMenuProps> = ({ menuData }) => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("menuCollapsed") === "true"; // Récupération depuis localStorage
  });

  useEffect(() => {
    localStorage.setItem("menuCollapsed", JSON.stringify(collapsed)); // Sauvegarde dans localStorage
  }, [collapsed]);

  return (
    <aside className={`bg-gray-900 text-white h-screen transition-all ${collapsed ? "w-16" : "w-64"} p-4`}>
      {/* Bouton pour toggle collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mb-4 flex items-center justify-center w-full py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      <nav>
        {menuData.map((item, index) => (
          <MenuItemComponent key={index} item={item} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  );
};

const MenuItemComponent: React.FC<{ item: MenuItem; collapsed: boolean }> = ({ item, collapsed }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-2">
      {item.children ? (
        <>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center w-full px-4 py-2 rounded-lg hover:bg-gray-800 transition ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon && iconMap[item.icon]}
              {!collapsed && <span>{item.label}</span>}
            </div>
            {!collapsed && (
              <ChevronDownIcon className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            )}
          </button>
          {isOpen && !collapsed && (
            <div className="pl-6 mt-1 space-y-1">
              {item.children.map((child, index) => (
                <MenuItemComponent key={index} item={child} collapsed={collapsed} />
              ))}
            </div>
          )}
        </>
      ) : (
        <a
          href={item.href || "#"}
          className={`flex items-center px-4 py-2 rounded-lg hover:bg-gray-800 transition ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          {item.icon && iconMap[item.icon]}
          {!collapsed && <span>{item.label}</span>}
        </a>
      )}
    </div>
  );
};

export default SideMenuDynamic;