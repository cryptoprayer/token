var PrayToken = artifacts.require("./PrayToken.sol");
var MainSale = artifacts.require("./MainSale.sol");
var CappedAirdrop = artifacts.require("./CappedAirdrop.sol");

module.exports = function(deployer) {
  deployer.deploy(PrayToken, 10*10**18).then(function() {
    return deployer.deploy(MainSale, 1549393846, 1549480246, 1, 5*10**18, '0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef', PrayToken.address).then(function() {
       return deployer.deploy(CappedAirdrop, 1549393846, 1549480246, PrayToken.address, 5*10**18);
     });
  });

  // end Monday, 5 February 2018 20:47:17
};
