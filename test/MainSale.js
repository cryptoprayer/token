import { advanceBlock } from 'zeppelin-solidity/test/helpers/advanceToBlock';
import latestTime from 'zeppelin-solidity/test/helpers/latestTime';
import { increaseTimeTo, duration } from 'zeppelin-solidity/test/helpers/increaseTime';
import expectThrow from 'zeppelin-solidity/test/helpers/expectThrow';

const PrayToken = artifacts.require('./PrayToken.sol');
const MainSale = artifacts.require('./MainSale.sol');

contract('MainSale', function ([owner, donor, other]) {
  let token;
  let sale;
  let vaultAddress = '0x41ffab0276136e35772e00a5cc8333185f5dbe3b';

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

  it('sends tokens according to exchange rate', async function () {
    await token.transferOwnership(sale.address);
    await increaseTimeTo(latestTime() + duration.weeks(2));
    await sale.sendTransaction({ value: 1*10**18, from: donor })
    assert.equal((await token.balanceOf(donor)).toNumber(), 2*10**18);
  })

  it('sends eth to vault', async function () {
    await token.transferOwnership(sale.address);
    await increaseTimeTo(latestTime() + duration.weeks(2));
    const pre = web3.eth.getBalance(vaultAddress).toNumber();
    await sale.sendTransaction({ value: 2*10**18, from: donor })
    const post = web3.eth.getBalance(vaultAddress).toNumber();
    assert.equal(post-pre, 2*10**18)
  })

  it('doesnt send tokens after start without ownership', async function () {
    await increaseTimeTo(latestTime() + duration.weeks(2));
    await expectThrow(sale.sendTransaction({ value: 2*10**18, from: donor }));
  })

  it('doesnt send tokens before start with ownership', async function () {
    await token.transferOwnership(sale.address);
    await expectThrow(sale.sendTransaction({ value: 2*10**18, from: donor }));
  })

  it('can transfer ownership back', async function () {
    await token.transferOwnership(sale.address);
    assert.equal(await token.owner(), sale.address);
    await await sale.transferTokenOwnership();
    assert.equal(await token.owner(), owner);
  })
})