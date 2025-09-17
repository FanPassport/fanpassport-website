"use client";

import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useClub } from "~~/hooks/useClub";

const Home: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const { clubs, loading, changeClub } = useClub();
  const router = useRouter();

  return (
    <>
      <Head>
        <title>FAN Passport | Web3 Fan Experience Platform</title>
        <meta
          name="description"
          content="FAN Passport is your gateway to exclusive club experiences, NFT rewards, and VIP access. Connect your wallet and join your favorite club's digital journey."
        />
        <meta property="og:title" content="FAN Passport | Web3 Fan Experience Platform" />
        <meta
          property="og:description"
          content="FAN Passport is your gateway to exclusive club experiences, NFT rewards, and VIP access. Connect your wallet and join your favorite club's digital journey."
        />
        <meta property="og:image" content="/logo-banner.jpg" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FAN Passport | Web3 Fan Experience Platform" />
        <meta
          name="twitter:description"
          content="FAN Passport is your gateway to exclusive club experiences, NFT rewards, and VIP access. Connect your wallet and join your favorite club's digital journey."
        />
        <meta name="twitter:image" content="/logo-banner.jpg" />
        <link rel="canonical" href="https://fanpassport.xyz/" />
      </Head>
      <div className="flex flex-col grow w-full">
        {/* Full-width banner with overlay */}
        <div className="relative w-full h-64 md:h-80 lg:h-[340px] overflow-hidden">
          <Image src="/logo-banner.jpg" alt="Fan Passport" fill className="object-cover w-full h-full" priority />
        </div>
        <div className="px-5 max-w-6xl w-full mx-auto mt-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="loading loading-spinner loading-lg mb-4"></div>
              <h1 className="text-4xl font-bold">Loading...</h1>
              <p className="text-lg mt-4">Loading clubs...</p>
            </div>
          ) : (
            <>
              <div className="text-center mt-10 mb-8">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-2">Choose your club</h1>
                <p className="text-lg md:text-xl text-base-content/80 mb-6">
                  Select your favorite club to access exclusive experiences and mint your FAN Passport NFT.
                </p>
                {!isConnected && (
                  <div className="flex flex-col items-center justify-center gap-4 mt-6">
                    <Address address={connectedAddress} />
                  </div>
                )}
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
                {clubs.map(club => (
                  <button
                    key={club.id}
                    onClick={async () => {
                      await changeClub(club.id);
                      router.push(`/${club.id}`);
                    }}
                    className="group bg-base-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-left cursor-pointer border border-base-200 hover:border-primary"
                  >
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto mb-6 relative">
                        <Image
                          src={club.logo}
                          alt={`${club.name} logo`}
                          width={128}
                          height={128}
                          className="w-full h-full object-contain rounded-full border border-base-200"
                        />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{club.name}</h3>
                    </div>
                  </button>
                ))}
              </div>

              {/* Info Section */}
              <div className="mt-16 bg-base-100 p-8 rounded-3xl shadow-lg max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <Image
                      src="/android-chrome-512x512.png"
                      alt="Fan Passport Logo"
                      width={64}
                      height={64}
                      className="rounded-full w-16 h-16"
                      priority
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">FAN Passport</h3>
                  <p className="text-base-content/70 mb-4 text-lg">
                    An evolving NFT that gives you access to exclusive experiences from your favorite club.
                  </p>
                  <div className="grid gap-4 md:grid-cols-3 text-base">
                    <div className="flex items-center justify-center">
                      <span className="text-2xl mr-2">🔓</span>
                      <span>Exclusive access</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-2xl mr-2">🎁</span>
                      <span>NFT rewards</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-2xl mr-2">🌟</span>
                      <span>VIP experiences</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
