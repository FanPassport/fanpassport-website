"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClubSelector } from "./ClubSelector";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { useClub } from "~~/hooks/useClub";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Gallery",
    href: "/gallery",
  },
  {
    label: "Marketplace",
    href: "/marketplace",
  },
  // {
  //   label: "Debug Contracts",
  //   href: "/debug",
  //   icon: <BugAntIcon className="h-4 w-4" />,
  // },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { currentClub } = useClub();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  // Default colors for SSR
  const defaultColors = {
    primary: "#004D98",
    secondary: "#DA291C",
    accent: "#FFFFFF",
  };

  const clubColors = mounted && currentClub?.colors ? currentClub.colors : defaultColors;

  return (
    <div
      className="sticky lg:static top-0 navbar bg-base-100 min-h-0 shrink-0 justify-between z-20 shadow-md px-0 sm:px-2"
      style={
        {
          "--club-primary": clubColors.primary,
          "--club-secondary": clubColors.secondary,
          "--club-accent": clubColors.accent,
        } as React.CSSProperties
      }
    >
      <div className="navbar-start w-auto lg:w-1/2">
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-transparent">
            <Bars3Icon className="h-1/2" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-sm bg-base-100 rounded-box w-52"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <div
              className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: "#c3c4c4" }}
            >
              🎫
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">FAN Passport</span>
            <span className="text-xs">Fan exclusive experiences for you</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-center grow mr-4 flex items-center gap-2">
        <ClubSelector />
      </div>
      <div className="navbar-end grow mr-4 flex items-center gap-2">
        <RainbowKitCustomConnectButton />
      </div>
    </div>
  );
};
