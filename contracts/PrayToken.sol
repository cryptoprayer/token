pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/token/ERC20/CappedToken.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';

/**
 * @title PrayToken
 * @dev cryptoprayer.org token
 */
contract PrayToken is CappedToken, Pausable {

  string public constant name = "PrayToken"; // solium-disable-line uppercase
  string public constant symbol = "PRAY"; // solium-disable-line uppercase
  uint8 public constant decimals = 18; // solium-disable-line uppercase

  function PrayToken(uint256 _cap) CappedToken(_cap) public {
  }

  function transfer(address _to, uint _value) whenNotPaused returns (bool) {
    return super.transfer(_to, _value);
  }

  function transferFrom(address _from, address _to, uint _value) whenNotPaused returns (bool) {
    return super.transferFrom(_from, _to, _value);
  }
}