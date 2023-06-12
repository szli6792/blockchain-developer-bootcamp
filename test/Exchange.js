const { ethers } = require('hardhat'); // pull ethers from hardhat library
const { expect } = require('chai');  // pull expect from chai library

const tokens = (n) => {
    return ethers.parseUnits(n.toString(), 'ether') // grab 1 million ether worth of wei
}

describe('Exchange', () => {
    // Test go inside here....
    let exchange, 
        accounts, 
        deployer,
        feeAccount,
        trader1,
        trader2
    
    const feePercent = 10

    beforeEach(async () => {
        // Create test accounts
        accounts  = await ethers.getSigners()
        deployer = await accounts[0]
        feeAccount = await accounts[1]
        trader1 = await accounts[2]
        trader2 = await accounts[3]

        // Fetch Token from Local Blockchain
        const Exchange = await ethers.getContractFactory('Exchange') // create smart contract for Exchange
        exchange = await Exchange.deploy(feeAccount, feePercent) // sends smart contract away for deployment, gets receipt
    })

    describe('Deployment', () => {

        it('Tracks the fee account', async () => {

            // Check that fee account is tracked
            expect(await exchange.feeAccount()).to.be.equal(await feeAccount.getAddress())
            console.log(`\t Fee Account: ${await exchange.feeAccount()}`)
        })

        it('Tracks the feepercent', async () => {

            // Check that fee account is tracked
            expect(await exchange.feePercent()).to.be.equal(feePercent)
            console.log(`\t Fee Account: ${await exchange.feePercent()}`)
        })
    })
})
