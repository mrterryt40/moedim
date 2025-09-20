// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TestContract {
    string public message = "Mo'edim Smart Contracts Working!";

    function getMessage() public view returns (string memory) {
        return message;
    }
}