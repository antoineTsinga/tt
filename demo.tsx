import Header from "my-shared-library/Header";
import { BellIcon, UserCircleIcon } from "@heroicons/react/24/outline";

const MyAppHeader = () => {
  return (
    <Header variant="dark">
      {/* Logo à gauche */}
      <div className="flex items-center gap-2">
        <img src="/logo-app1.svg" alt="Logo App 1" className="h-8" />
        <span className="text-lg font-bold">App 1</span>
      </div>

      {/* Groupe de liens */}
      <Header.LinkGroup>
        <a href="/" className="hover:underline">Accueil</a>
        <a href="/dashboard" className="hover:underline">Dashboard</a>
      </Header.LinkGroup>

      {/* Groupe d'actions à droite */}
      <Header.ActionGroup>
        <BellIcon className="h-6 w-6 cursor-pointer" />
        <UserCircleIcon className="h-6 w-6 cursor-pointer" />
      </Header.ActionGroup>
    </Header>
  );
};

export default MyAppHeader;