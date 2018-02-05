pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';

// TODO: price of the transaction

contract Airdrop is Ownable {
  using SafeMath for uint256;
  // The token being sold
  MintableToken public token;

  // start and end timestamps where investments are allowed (both inclusive)
  uint256 public startTime;
  uint256 public endTime;
  uint256 public tokensSent;

  function Airdrop(uint256 _startTime, uint256 _endTime, MintableToken _token) public {
    require(_startTime >= now);
    require(_endTime >= _startTime);
    require(_token != address(0));
    startTime = _startTime;
    endTime = _endTime;
    token = _token;
  }

  function multisend(address[] dests, uint256[] values) public onlyOwner
    returns (uint256) {
    uint256 i = 0;
    while (i < dests.length) {
      require(validPurchase(values[i]));
      token.mint(dests[i], values[i]);
      tokensSent = tokensSent.add(values[i]);
      i += 1;
    }
    return(i);
  }

  // @return true if the transaction can buy tokens
  function validPurchase(uint256 _tokens) internal view returns (bool) {
    bool withinPeriod = now >= startTime && now <= endTime;
    return withinPeriod;
  }
}

contract CappedAirdrop is Airdrop {
  uint256 public cap;

  function CappedAirdrop(uint256 _startTime, uint256 _endTime, MintableToken _token, uint256 _cap) public 
    Airdrop(_startTime, _endTime, _token)
  {
    require(_cap > 0);
    cap = _cap;
  }

  function validPurchase(uint256 _tokens) internal view returns (bool) {
    bool withinCap = tokensSent.add(tokensSent) <= cap;
    return withinCap && super.validPurchase(_tokens);
  }
}