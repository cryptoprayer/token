import { advanceBlock } from 'zeppelin-solidity/test/helpers/advanceToBlock';
import latestTime from 'zeppelin-solidity/test/helpers/latestTime';
import { increaseTimeTo, duration } from 'zeppelin-solidity/test/helpers/increaseTime';
import expectThrow from 'zeppelin-solidity/test/helpers/expectThrow';

const PrayToken = artifacts.require('./PrayToken.sol');
const CappedAirdrop = artifacts.require('./CappedAirdrop.sol');
const MainSale = artifacts.require('./MainSale.sol');


contract('AirdropWithSale', function ([owner, donor1, donor2, donor3]) {
  let token;
  let drop;
  let sale;
  let airdropRequester1 = '0x98fe1aba4ec2a2e14731c17ce4610cff870df298';
  let airdropRequester2 = '0xe6f2d7deb958a74f750d375ab2bedfe22ea2c572';
  let airdropRequester3 = '0x603fbfb8dbeb2d6f0f997e873a0f9d2e49fe815c';


  before(async function () {
    await advanceBlock();
  });

  beforeEach('setup contract for each test', async function () {
      token = await PrayToken.new(1000000*10**18); // 1 million tokens
      drop = await CappedAirdrop.new(latestTime() + duration.weeks(1), latestTime() + duration.weeks(2), token.address, 10000*10**18);
  })

  async function initSale(wallet) {
    sale = await MainSale.new(latestTime() + duration.weeks(3), latestTime() + duration.weeks(4), 2, 100000*10**18, 990000*10**18, wallet, token.address);
  }

  it('airdrops and transfers eth if goal is reached', async function () {
    const wallet = '0xe823f4c8f50ef3fc1cb711f7838044cff032bc22'

    // Airdrop phase
    initSale(wallet);
    await token.pause();
    await increaseTimeTo(latestTime() + duration.days(8));
    await token.transferOwnership(drop.address);
    await drop.multisend([airdropRequester1, airdropRequester2, donor1], 1000*10**18);
    await drop.multisend([airdropRequester1], 3000*10**18);
    await drop.transferTokenOwnership();

    // Sale phase
    await token.transferOwnership(sale.address);
    await increaseTimeTo(latestTime() + duration.days(16));
    await sale.sendTransaction({ value: 50000*10**18, from: donor1, gasPrice: 0 })
    await sale.sendTransaction({ value: 70000*10**18, from: donor2, gasPrice: 0 })
    await sale.sendTransaction({ value: 40000*10**18, from: donor3, gasPrice: 0 })
    await sale.sendTransaction({ value: 20000*10**18, from: donor3, gasPrice: 0 })

    // After Sale phase
    await increaseTimeTo(latestTime() + duration.days(29));
    await sale.transferTokenOwnership();
    await sale.finalize();
    await token.finishMinting();
    await token.unpause();

    // Assertions
    assert.equal((await token.balanceOf(airdropRequester1)).toNumber(), 4000*10**18);
    assert.equal((await token.balanceOf(airdropRequester2)).toNumber(), 1000*10**18);

    assert.equal((await token.balanceOf(donor1)).toNumber(), 101000*10**18);
    assert.equal((await token.balanceOf(donor2)).toNumber(), 140000*10**18);
    assert.equal((await token.balanceOf(donor3)).toNumber(), 120000*10**18);
    assert.equal(web3.eth.getBalance(wallet).toNumber(), 180000*10**18);
  })

  it('airdrops and refunds eth if goal not reached', async function () {
    const wallet = '0x41ffab0276136e35772e00a5cc8333185f5dbe3b';
    const preDonor1 = web3.eth.getBalance(donor1).toNumber();
    const preDonor2 = web3.eth.getBalance(donor2).toNumber();
    const preDonor3 = web3.eth.getBalance(donor3).toNumber();

    // Airdrop phase
    initSale(wallet);
    await token.pause();
    await increaseTimeTo(latestTime() + duration.days(8));
    await token.transferOwnership(drop.address);
    await drop.multisend([airdropRequester1, airdropRequester2, donor1], 1000*10**18);
    await drop.multisend([airdropRequester1], 3000*10**18);
    await drop.transferTokenOwnership();

    // Sale phase
    await token.transferOwnership(sale.address);
    await increaseTimeTo(latestTime() + duration.days(16));
    await sale.sendTransaction({ value: 10000*10**18, from: donor1, gasPrice: 0 })
    await sale.sendTransaction({ value: 5000*10**18, from: donor2, gasPrice: 0 })
    await sale.sendTransaction({ value: 100*10**18, from: donor3, gasPrice: 0 })
    await sale.sendTransaction({ value: 1900*10**18, from: donor3, gasPrice: 0 })

    // After Sale phase
    await increaseTimeTo(latestTime() + duration.days(29));
    await sale.transferTokenOwnership();
    await sale.finalize();
    await token.finishMinting();

    // Assertions
    assert.equal((await token.balanceOf(airdropRequester1)).toNumber(), 4000*10**18);
    assert.equal((await token.balanceOf(airdropRequester2)).toNumber(), 1000*10**18);

    assert.equal((await token.balanceOf(donor1)).toNumber(), 21000*10**18);
    assert.equal((await token.balanceOf(donor2)).toNumber(), 10000*10**18);
    assert.equal((await token.balanceOf(donor3)).toNumber(), 4000*10**18);

    assert.equal(preDonor1 - web3.eth.getBalance(donor1).toNumber(), 0);
    assert.equal(preDonor2 - web3.eth.getBalance(donor2).toNumber(), 0);
    assert.equal(preDonor3 - web3.eth.getBalance(donor3).toNumber(), 0);
    assert.equal(web3.eth.getBalance(wallet).toNumber(), 0);
  })
})