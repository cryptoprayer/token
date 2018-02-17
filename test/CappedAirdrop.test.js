import { advanceBlock } from 'zeppelin-solidity/test/helpers/advanceToBlock';
import latestTime from 'zeppelin-solidity/test/helpers/latestTime';
import { increaseTimeTo, duration } from 'zeppelin-solidity/test/helpers/increaseTime';
import expectThrow from 'zeppelin-solidity/test/helpers/expectThrow';

const PrayToken = artifacts.require('./PrayToken.sol');
const CappedAirdrop = artifacts.require('./CappedAirdrop.sol');

contract('CappedAirdrop', function ([owner, owner2, owner3]) {
  let token;
  let drop;

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach('setup contract for each test', async function () {
      token = await PrayToken.new(10*10**18);
      drop = await CappedAirdrop.new(latestTime() + duration.weeks(1), latestTime() + duration.weeks(3), token.address, 5*10**18);
  })

  it('has an owner', async function () {
      assert.equal(await drop .owner(), owner);
  })

  it('has a cap set', async function () {
      assert.equal(await drop.cap(), 5*10**18);
  })

  it('cannot mint without ownership', async function () {
    await increaseTimeTo(latestTime() + duration.weeks(2));
    await expectThrow(drop.multisend([owner2], 1));
  })

  it('cannot mint with beforeStart date', async function () {
    await token.transferOwnership(drop.address);
    await expectThrow(drop.multisend([owner2], 1));
  })

  it('can mint after stard date and not after end date with ownership', async function () {
    await token.transferOwnership(drop.address);
    await increaseTimeTo(latestTime() + duration.weeks(2));
    await drop.multisend([owner2, owner3], 2*10**18);
    assert.equal((await token.balanceOf(owner)).toNumber(), 0);
    assert.equal((await token.balanceOf(owner2)).toNumber(), 2*10**18);
    assert.equal((await token.balanceOf(owner3)).toNumber(), 2*10**18);
    await increaseTimeTo(latestTime() + duration.weeks(2));
    await expectThrow(drop.multisend([owner2], 1*10**18));
  })

  it('increases tokensSent', async function () {
    await token.transferOwnership(drop.address);
    await increaseTimeTo(latestTime() + duration.weeks(2));
    await drop.multisend([owner2], 2*10**18);
    assert.equal((await drop.tokensSent()).toNumber(), 2*10**18);
  })

  it('cannot mint more than 5 tokens', async function () {
    await token.transferOwnership(drop.address);
    await increaseTimeTo(latestTime() + duration.weeks(2));
    await drop.multisend([owner2], 5*10**18);
    await expectThrow(drop.multisend([owner2], 1));
  })

  it('can transfer ownership back', async function () {
    await token.transferOwnership(drop.address);
    assert.equal(await token.owner(), drop.address);
    await drop.transferTokenOwnership();
    assert.equal(await token.owner(), owner);
  })
})