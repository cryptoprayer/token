pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/token/ERC20/CappedToken.sol';

/**
 * @title PrayToken
 * @dev cryptoprayer.org token
 */

contract PrayToken is CappedToken {


  string public constant name = "PrayToken"; // solium-disable-line uppercase
  string public constant symbol = "PRAY"; // solium-disable-line uppercase
  uint8 public constant decimals = 18; // solium-disable-line uppercase

  function PrayToken(uint256 _cap) CappedToken(_cap) public {
  }

}