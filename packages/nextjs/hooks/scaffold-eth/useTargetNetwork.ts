import { useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";
import { useGlobalState } from "~~/services/store/store";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";
import { NETWORKS_EXTRA_DATA } from "~~/utils/scaffold-eth";

/**
 * Retrieves the connected wallet's network from scaffold.config or defaults to the 0th network in the list if the wallet is not connected.
 */
export function useTargetNetwork(): { targetNetwork: ChainWithAttributes } {
  const { chain } = useAccount();
  const targetNetwork = useGlobalState(({ targetNetwork }) => targetNetwork);
  const setTargetNetwork = useGlobalState(({ setTargetNetwork }) => setTargetNetwork);

  useEffect(() => {
    console.log("🔍 Debug - useTargetNetwork:");
    console.log("  - Connected chain ID:", chain?.id);
    console.log("  - Connected chain name:", chain?.name);
    console.log("  - Current targetNetwork ID:", targetNetwork.id);
    console.log("  - Current targetNetwork name:", targetNetwork.name);
    console.log(
      "  - Available networks:",
      scaffoldConfig.targetNetworks.map(n => `${n.name} (${n.id})`),
    );

    const newSelectedNetwork = scaffoldConfig.targetNetworks.find(targetNetwork => targetNetwork.id === chain?.id);
    console.log("  - Found matching network:", newSelectedNetwork?.name);

    if (newSelectedNetwork && newSelectedNetwork.id !== targetNetwork.id) {
      console.log("  - Switching to network:", newSelectedNetwork.name);
      setTargetNetwork({ ...newSelectedNetwork, ...NETWORKS_EXTRA_DATA[newSelectedNetwork.id] });
    } else if (!newSelectedNetwork) {
      console.log("  - No matching network found, keeping current network");
    }
  }, [chain?.id, setTargetNetwork, targetNetwork.id]);

  return useMemo(() => ({ targetNetwork }), [targetNetwork]);
}
