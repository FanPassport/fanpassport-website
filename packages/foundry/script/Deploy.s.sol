// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "forge-std/Script.sol";
import "../contracts/ExperienceNFT.sol";
import "../contracts/MatchNFT.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy ExperienceNFT contract
        ExperienceNFT experienceNFT = new ExperienceNFT();
        console.log("ExperienceNFT deployed at:", address(experienceNFT));

        // Deploy MatchNFT contract
        MatchNFT matchNFT = new MatchNFT();
        console.log("MatchNFT deployed at:", address(matchNFT));

        vm.stopBroadcast();

        console.log("=== Deployment Summary ===");
        console.log("ExperienceNFT:", address(experienceNFT));
        console.log("MatchNFT:", address(matchNFT));
    }
} 