//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "reference/ERC6551Registry.sol";

contract DeployRegistryOnly is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy ERC-6551 Registry
        ERC6551Registry registry = new ERC6551Registry();
        console.log("ERC6551Registry deployed at:", address(registry));

        vm.stopBroadcast();

        console.log("=== Registry Address ===");
        console.log("ERC6551Registry:", address(registry));
    }
} 