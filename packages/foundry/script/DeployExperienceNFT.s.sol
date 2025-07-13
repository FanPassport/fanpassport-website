// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "forge-std/Script.sol";
import "../contracts/ExperienceNFT.sol";

contract DeployExperienceNFT is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ExperienceNFT experienceNFT = new ExperienceNFT();

        vm.stopBroadcast();

        console.log("ExperienceNFT deployed at:", address(experienceNFT));
    }
} 