import { advanceBlock } from 'zeppelin-solidity/test/helpers/advanceToBlock';
import latestTime from 'zeppelin-solidity/test/helpers/latestTime';
import { increaseTimeTo, duration } from 'zeppelin-solidity/test/helpers/increaseTime';
import expectThrow from 'zeppelin-solidity/test/helpers/expectThrow';

const PrayToken = artifacts.require('./PrayToken.sol');
const MainSale = artifacts.require('./MainSale.sol');

contract('MainSale', function ([owner, other, other2]) {
  let token;
  let sale;
  let vaultAddress = '0x609ad434961f8494597414ef2ae0c728b68cd4d5';

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach('setup contract for each test', async function () {
      token = await PrayToken.new(10*10**18);
      sale = await MainSale.new(latestTime() + duration.weeks(1), latestTime() + duration.weeks(3), 2, 5*10**18, vaultAddress, token.address);
  })

  it('has an owner', async function () {
      assert.equal(await sale.owner(), owner);
  })
})