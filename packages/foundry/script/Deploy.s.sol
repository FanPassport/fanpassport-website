// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "forge-std/Script.sol";
import "../contracts/ERC6551Account.sol";
import "../contracts/ExperienceNFT.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy ERC6551Account implementation
        ERC6551Account accountImplementation = new ERC6551Account();
        console.log("ERC6551Account implementation deployed at:", address(accountImplementation));

        // Deploy ExperienceNFT contract
        ExperienceNFT experienceNFT = new ExperienceNFT();
        console.log("ExperienceNFT deployed at:", address(experienceNFT));

        vm.stopBroadcast();

        console.log("=== Deployment Summary ===");
        console.log("ERC6551Account implementation:", address(accountImplementation));
        console.log("ExperienceNFT:", address(experienceNFT));
    }
} 