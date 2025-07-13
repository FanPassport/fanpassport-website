"use client";

import { useEffect, useState } from "react";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { useClub } from "~~/hooks/useClub";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();
  const { currentClub, loading } = useClub();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  // Create dynamic background and CSS variables based on club colors
  const getBackgroundStyle = () => {
    if (loading || !currentClub) {
      return {};
    }

    const { primary, secondary, accent } = currentClub.colors;

    const baseStyle = {
      minHeight: "100vh",
      // CSS custom properties for club colors
      "--club-primary": primary,
      "--club-secondary": secondary,
      "--club-accent": accent,
    } as React.CSSProperties;

    if (isDarkMode) {
      // Dark mode: more visible gradient with club colors
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${primary}20 0%, ${secondary}15 50%, ${primary}20 100%)`,
      };
    } else {
      // Light mode: well visible gradient with club colors
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${primary}25 0%, ${secondary}20 50%, ${primary}25 100%)`,
      };
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen transition-all duration-500" style={getBackgroundStyle()}>
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          avatar={BlockieAvatar}
          theme={mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()}
        >
          <ProgressBar height="3px" color="#2299dd" />
          <ScaffoldEthApp>{children}</ScaffoldEthApp>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
