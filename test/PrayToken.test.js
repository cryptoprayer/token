const PrayToken = artifacts.require('./PrayToken.sol')

contract('PrayToken', function ([owner, owner2]) {
  let token

  beforeEach('setup contract for each test', async function () {
      token = await PrayToken.new(10*10**18);
  })

  it('has an owner', async function () {
      assert.equal(await token.owner(), owner);
  })

  it('has a cap set', async function () {
      assert.equal(await token.cap(), 10*10**18);
  })

  it('allows owner to mint', async function () {
      await token.mint(owner2, 2*10**18);
      assert.equal((await token.balanceOf(owner2)).toNumber(), 2*10**18);
  })
})