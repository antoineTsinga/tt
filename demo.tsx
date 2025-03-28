import SideMenuDynamic from "my-shared-library/SideMenuDynamic";

const menuData = [
  {
    label: "Accueil",
    icon: "home",
    href: "/"
  },
  {
    label: "Analytics",
    icon: "chart-bar",
    children: [
      {
        label: "Tableau de bord",
        href: "/dashboard"
      },
      {
        label: "Rapports",
        href: "/reports",
        children: [
          {
            label: "Rapport Mensuel",
            href: "/reports/monthly"
          },
          {
            label: "Rapport Annuel",
            href: "/reports/yearly"
          }
        ]
      }
    ]
  },
  {
    label: "Compte",
    icon: "user",
    children: [
      {
        label: "Profil",
        href: "/profile"
      },
      {
        label: "Paramètres",
        href: "/settings"
      }
    ]
  }
];

const MyAppSideMenu = () => {
  return <SideMenuDynamic menuData={menuData} />;
};

export default MyAppSideMenu;