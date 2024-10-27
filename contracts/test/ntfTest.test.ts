import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { ContractFactory, Contract, Signer } from 'ethers'
import { ethers } from 'hardhat'

describe('CardNFT', function () {
  let MyToken: ContractFactory
  let myToken: Contract
  let owner: SignerWithAddress
  let addr1: SignerWithAddress
  let addr2: SignerWithAddress

  before(async function () {
    ;[owner, addr1, addr2] = await ethers.getSigners()

    console.log({ owner, addr1, addr2 })

    MyToken = await ethers.getContractFactory('CardNFT')
    console.log('FACTORY')
    myToken = await MyToken.deploy(owner.address)
    await myToken.deployed()
    console.log('DEPLOYED')
  })

  it('Should deploy with the correct name and symbol', async function () {
    expect(await myToken.name()).to.equal('CardNFT')
    expect(await myToken.symbol()).to.equal('CNFT')
  })

  it('Should mint tokens to an address', async function () {
    const mintTx = await myToken.connect(owner).safeMint(addr1.address)
    await mintTx.wait()

    const totalSupply = await myToken.totalSupply()
    expect(totalSupply).to.equal(1)

    const ownerOfToken = await myToken.ownerOf(0)
    expect(ownerOfToken).to.equal(addr1.address)
  })

  it('Should return a list of tokens owned by an address', async function () {
    const ownedTokens = await myToken.getTokensForOwner(addr1.address)
    console.log({ ownedTokens })
    expect(ownedTokens.length).to.equal(1)
    expect(ownedTokens[0]).to.equal(0)
  })
})
