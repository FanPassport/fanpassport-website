// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../contracts/MatchNFT.sol";

contract DeployMatchNFT is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        MatchNFT matchNFT = new MatchNFT();

        vm.stopBroadcast();

        console.log("MatchNFT deployed at:", address(matchNFT));
    }
}