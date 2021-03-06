pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';

contract Airdrop is Ownable {

  using SafeMath for uint256;
  // The token being sold
  MintableToken public token;

  // start and end timestamps where investments are allowed (both inclusive)
  uint256 public startTime;
  uint256 public endTime;

  // total number of tokens minted by airdrop
  uint256 public tokensSent;

  function Airdrop(uint256 _startTime, uint256 _endTime, MintableToken _token) public {
    require(_startTime >= now);
    require(_endTime >= _startTime);
    require(_token != address(0));
    startTime = _startTime;
    endTime = _endTime;
    token = _token;
  }

  function multisend(address[] _dests, uint256 _tokens) public onlyOwner
    returns (uint256) {
    uint256 i = 0;
    while (i < _dests.length) {
      require(validPurchase(_tokens));
      token.mint(_dests[i], _tokens);
      tokensSent = tokensSent.add(_tokens);
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
  address public owner;


  function CappedAirdrop(uint256 _startTime, uint256 _endTime, MintableToken _token, uint256 _cap) public 
    Airdrop(_startTime, _endTime, _token) {
    require(_cap > 0);
    cap = _cap;
    owner = msg.sender;
  }

  function validPurchase(uint256 _tokens) internal view returns (bool) {
    bool withinCap = tokensSent.add(tokensSent) <= cap;
    return withinCap && super.validPurchase(_tokens);
  }

  function transferTokenOwnership() public {
    require(msg.sender == owner); // Only the owner of the crowdsale contract should be able to call this function.
    require(owner != address(0));
    token.transferOwnership(owner);
  }
}