import React from "react";
import Link from "next/link";
import { hardhat } from "viem/chains";
import { CurrencyDollarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet, FaucetButton } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useGlobalState } from "~~/services/store/store";

/**
 * Site footer
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0">
      {process.env.NODE_ENV !== "production" && (
        <div>
          <div className="fixed flex justify-between items-center w-full z-10 p-4 bottom-0 left-0 pointer-events-none">
            <div className="flex flex-col md:flex-row gap-2 pointer-events-auto">
              {nativeCurrencyPrice > 0 && (
                <div>
                  <div className="btn btn-primary btn-sm font-normal gap-1 cursor-auto">
                    <CurrencyDollarIcon className="h-4 w-4" />
                    <span>{nativeCurrencyPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}
              {isLocalNetwork && (
                <>
                  <Faucet />
                  <Link href="/blockexplorer" passHref className="btn btn-primary btn-sm font-normal gap-1">
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    <span>Block Explorer</span>
                  </Link>
                  {isLocalNetwork && <FaucetButton />}
                </>
              )}
            </div>
            <SwitchTheme className={`pointer-events-auto ${isLocalNetwork ? "self-end md:self-auto" : ""}`} />
          </div>
        </div>
      )}
      <div className="w-full">
        <ul className="menu menu-horizontal w-full">
          <div className="flex justify-center items-center gap-2 text-sm w-full">
            <div className="flex justify-center items-center gap-2">
              <p className="m-0 text-center">
                Built at the iconic Parc des Princes stadium in Paris, home of{" "}
                <Link href="/psg" className="underline">
                  PSG
                </Link>
                , during the{" "}
                <a href="https://chiliz.com" target="_blank" rel="noopener noreferrer" className="underline">
                  Chiliz
                </a>{" "}
                &{" "}
                <a href="https://socios.com" target="_blank" rel="noopener noreferrer" className="underline">
                  Socios
                </a>{" "}
                Hackathon
              </p>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <a
                href="https://x.com/fanpassport"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-base-content/80 hover:text-primary flex items-center gap-2"
                aria-label="FanPassport on X"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M22 5.924c-.63.28-1.307.472-2.02.558.727-.436 1.285-1.128 1.55-1.953-.68.403-1.433.697-2.233.856C18.88 4.29 17.96 4 17 4c-1.66 0-3.003 1.343-3.003 3 0 .235.025.464.078.684C10.16 7.574 7.07 6.025 5.02 3.57c-.257.442-.404.956-.404 1.502 0 1.038.528 1.955 1.335 2.493-.49-.016-.95-.15-1.352-.374v.038c0 1.45 1.03 2.66 2.397 2.936-.25.07-.514.107-.786.107-.192 0-.378-.018-.56-.053.379 1.183 1.476 2.043 2.776 2.066C7.29 16.02 6.03 16.64 4.62 16.64c-.273 0-.543-.016-.81-.05 1.503.964 3.28 1.526 5.197 1.526 6.235 0 9.647-5.165 9.647-9.645v-.44c.66-.477 1.233-1.07 1.689-1.75-.605.268-1.25.45-1.93.53z" />
                </svg>
                <span className="hidden sm:inline">X</span>
              </a>

              <a
                href="https://t.me/fanpassport"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-base-content/80 hover:text-primary flex items-center gap-2"
                aria-label="FanPassport on Telegram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M21.5 3.5L2.5 10.5c-.6.2-.6.8-.1 1l4.2 1.4 1.6 5.2c.2.6.8.8 1.3.4l2.1-1.6 3.5 2.6c.7.5 1.6.1 1.8-.8l3.3-15c.2-.9-.6-1.7-1.5-1.4zM9.4 13.1l-.7 3.3-1.6-5.2 10.3-4.8-7.9 6.7z" />
                </svg>
                <span className="hidden sm:inline">Telegram</span>
              </a>
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
};
