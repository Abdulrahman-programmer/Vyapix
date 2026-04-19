import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import dashboardIcon from '../assets/dashboard.svg';
import inventoryIcon from '../assets/inventory.svg';
import salesIcon from '../assets/sales.svg';
import reportIcon from '../assets/report.svg';
import lowstockIcon from '../assets/lowStock.svg';
import settingIcon from '../assets/setting.svg';
import logoutIcon from '../assets/logout.svg';
import menuIcon from '../assets/menu.svg';
import closeIcon from '../assets/close.svg';
import "./components.css";
import DarkModeToggle from "./Btn-toggle";


const menuItems = [
  { name: "Dashboard", link: ".", icon: dashboardIcon },
  { name: "Inventory", link: "inventory", icon: inventoryIcon },
  { name: "Sales", link: "sales", icon: salesIcon },
  { name: "Report", link: "report", icon: reportIcon },
  { name: "LowStock", link: "lowstock", icon: lowstockIcon },
  { name: "Logout", link: "/", icon: logoutIcon },
];

const Menu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const name = sessionStorage.getItem("userName") || "User";
  const email = sessionStorage.getItem("userEmail") || "user@example.com";


  const profile =
    "https://imgs.search.brave.com/6IiIGZaOSARbb0xKycMP0GIfeVl-K2BJxAoiDxUalc8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMTgv/NzQyLzAxNS9zbWFs/bC9taW5pbWFsLXBy/b2ZpbGUtYWNjb3Vu/dC1zeW1ib2wtdXNl/ci1pbnRlcmZhY2Ut/dGhlbWUtM2QtaWNv/bi1yZW5kZXJpbmct/aWxsdXN0cmF0aW9u/LWlzb2xhdGVkLWlu/LXRyYW5zcGFyZW50/LWJhY2tncm91bmQt/cG5nLnBuZw";

  const icon = open ? closeIcon : menuIcon;

  // ------------------------------
  // FIX: Proper logout handler
  // ------------------------------
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
    setOpen(false);
  };

  // ------------------------------
  // FIX: Close only on small screens
  // ------------------------------
  const handleMenuClick = () => {
    if (window.innerWidth < 1024) {
      setOpen(false);
    }
  };

  return (
    <div className="bg-blue-950">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed top-4 left-2 z-150 bg-white ${
          open ? "rounded-full" : "rounded-md"
        } shadow-[0px_0px_10px_rgba(0,0,0,0.5)]
                transition-all duration-200 ease-in transition-discrete
                p-2 focus:outline-none lg:h-0 lg:w-0 lg:p-0 lg:invisible dark:bg-gray-500`}
      >
        <img src={icon} alt="Menu Icon" className="w-8 h-8" />
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 h-screen bg-black bg-opacity-10 transition-opacity duration-300 z-40 ${
          open
            ? "opacity-50 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } lg:hidden`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <nav
        className={`
            fixed top-0 left-0 h-screen w-64 bg-blue-950 shadow-lg z-50 py-20
            transform transition-transform duration-300
            ${open ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:shadow-none dark:bg-gray-800
        `}
      >
        <DarkModeToggle islogin={true} />

        {/* Profile */}
        <div className="flex flex-col items-center border-b border-gray-300 dark:border-gray-600">
          <img
            src={profile}
            alt="Profile"
            className="w-20 h-20 rounded-full mb-2 object-cover"
          />
          <h2 className="text-white text-lg font-semibold">{name}</h2>
          <p className="text-gray-300 text-xs mb-4">{email}</p>
        </div>

        {/* Menu Items */}
        <ul className="lg:mt-8 space-y-2 px-6 py-5 flex flex-col">
          {menuItems.map((item) => (
            <li key={item.name}>
              {item.name === "Logout" ? (
                <button
                  onClick={handleLogout}
                  className="flex w-full py-2 rounded-md gap-2 bg-blue-200 px-12 hover:bg-gray-300 hover:scale-110 transition-all duration-300 dark:bg-gray-700 dark:hover:bg-gray-500"
                >
                  <img src={item.icon} alt="" />
                  Logout
                </button>
              ) : (
                <Link to={item.link} onClick={handleMenuClick}>
                  <button className="flex w-full py-2 rounded-md gap-2 bg-blue-200 px-12 hover:bg-gray-300 hover:scale-110 transition-all duration-300 dark:bg-gray-700 dark:hover:bg-gray-500">
                    <img src={item.icon} alt="" />
                    {item.name}
                  </button>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Menu;
