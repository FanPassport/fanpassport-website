"use client";

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
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 max-w-6xl w-full">
          {loading ? (
            <div className="text-center">
              <div className="loading loading-spinner loading-lg mb-4"></div>
              <h1 className="text-4xl font-bold">Loading...</h1>
              <p className="text-lg mt-4">Loading clubs...</p>
            </div>
          ) : (
            <>
              <h1 className="text-center">
                <span className="block text-4xl font-bold">
                  {!isConnected ? "Connect your wallet" : "Choose your club"}
                </span>
              </h1>

              <div className="text-center mt-6">
                <p className="text-lg mb-8">
                  {!isConnected
                    ? "Connect your wallet to start your FAN Passport journey and access exclusive club experiences."
                    : "Select your favorite club to access exclusive experiences and mint your FAN Passport NFT."}
                </p>

                {!isConnected && (
                  <>
                    <div className="flex justify-center items-center space-x-2 flex-col mb-8 w-full">
                      <Image
                        src="/logo-banner.jpg"
                        alt="Fan Passport"
                        width={1920}
                        height={1080}
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="flex justify-center items-center space-x-2 flex-col mb-8">
                      <p className="my-2 font-medium">Connect your wallet to start</p>
                      <Address address={connectedAddress} />
                    </div>
                  </>
                )}
              </div>

              {isConnected && (
                <>
                  {/* Clubs Grid */}
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
                    {clubs.map(club => (
                      <button
                        key={club.id}
                        onClick={async () => {
                          await changeClub(club.id);
                          router.push(`/${club.id}`);
                        }}
                        className="group bg-base-100 rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-left cursor-pointer"
                      >
                        <div className="text-center">
                          <div className="w-32 h-32 mx-auto mb-6 relative">
                            <Image
                              src={club.logo}
                              alt={`${club.name} logo`}
                              width={128}
                              height={128}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <h3 className="text-xl font-bold mb-2">{club.name}</h3>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Info Section */}
              <div className="mt-12 bg-base-100 p-6 rounded-3xl">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎫</div>
                  <h3 className="text-xl font-bold mb-2">FAN Passport</h3>
                  <p className="text-base-content/70 mb-4">
                    An evolving NFT that gives you access to exclusive experiences from your favorite club.
                  </p>
                  <div className="grid gap-4 md:grid-cols-3 text-sm">
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
