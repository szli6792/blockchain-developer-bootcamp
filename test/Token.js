const { ethers } = require('hardhat'); // pull ethers from hardhat library
const { expect } = require('chai');  // pull expect from chai library

const tokens = (n) => {
    return ethers.parseUnits(n.toString(), 'ether') // grab 1 million ether worth of wei
}

describe('Token', () => {
    // Test go inside here....
    let token, 
        accounts, 
        deployer,
        receiver

    beforeEach(async () => {
        // Create test accounts
        accounts  = await ethers.getSigners()
        deployer = await accounts[0]
        receiver = await accounts[1]

        // Fetch Token from Local Blockchain
        const Token = await ethers.getContractFactory('Token') // create smart contract
        token = await Token.deploy('Gielda','GEDA', 1000000) // sends smart contract away for deployment
    })

    describe('Deployment', () => {
        const name = 'Gielda'
        const symbol = 'GEDA'
        const decimals = '18'
        const totalSupply = tokens(1000000)


        it('Has the correct name', async () => {

            // Check that name is correct
            expect(await token.name()).to.equal(name)
            console.log(`\t Token name: ${await token.name()}`)
        })
    
        it('Has the correct symbol', async () => {
    
            // Check that  symbol is correct
            expect(await token.symbol()).to.equal(symbol)
            console.log(`\t Token symbol: ${await token.symbol()}`)
        })
    
        it('Has the correct decimals', async () => {
    
            // Check that decimals is correct
            expect(await token.decimals()).to.equal(decimals)
            console.log(`\t Token decimals: ${await token.decimals()}`)
        })
    
        it('Has the correct total supply', async () => {
    
            // Check that supply is correct
            expect(await token.totalSupply()).to.equal(totalSupply)
            console.log(`\t Token supply: ${await token.totalSupply()}`)
        })

        it('Assigns token supply to deployer', async () => {
    
            // Check that supply is funded to deployer
            expect(await token.balanceOf(deployer)).to.equal(totalSupply)
            console.log(`\t Deployer balance: ${await token.balanceOf(deployer)}`)
        })
    })

    describe('Token transfer', () => {
        let amount, transaction, result, totalSupply

        describe('Test valid transfer:', () => {

            beforeEach(async () => {
                amount = tokens(100)

                totalSupply = await token.totalSupply()

                // Log balances before transfer
                expect(await token.balanceOf(deployer)).to.equal(BigInt(totalSupply))
                console.log(`\t   Deployer balance before: ${await token.balanceOf(deployer)}`)

                expect(await token.balanceOf(receiver)).to.equal(0)
                console.log(`\t   Receiver balance before: ${await token.balanceOf(receiver)}`)

                // Make a token transfer
                
                transaction = await token.connect(deployer).transfer(receiver, amount) // connects deployer wallet to write to blockchain (pay the gas fee to sign  which prevents network spam)
                result = await transaction.wait() // wait for transaction to finish
            })

            it('Transfers token balance', async () => {
                // Log balances after transfer
                expect(await token.balanceOf(deployer)).to.equal(BigInt(totalSupply) - amount)
                console.log(`\t   Deployer balance after: ${await token.balanceOf(deployer)}`)

                expect(await token.balanceOf(receiver)).to.equal(amount)
                console.log(`\t   Receiver balance after: ${await token.balanceOf(receiver)}`)
            })

            it('Emits a transfer event', async () => {

                // Check event name
                expect(result.logs[0].fragment.name).to.equal('Transfer')
                console.log(`\t   Event Name: ${result.logs[0].fragment.name}`)

                // Check event details
                expect(result.logs[0].args.from).to.equal(await deployer.getAddress())
                console.log(`\t   Sender Address: ${result.logs[0].args.from}`)
                expect(result.logs[0].args.to).to.equal(await receiver.getAddress())
                console.log(`\t   Receiver Address: ${result.logs[0].args.to}`)
                expect(result.logs[0].args.value).to.equal(amount)
                console.log(`\t   Amount Sent: ${result.logs[0].args.value}`)
            })
        })

        describe('Test invalid transfer:', () => {

            it('Rejects insufficient balance', async () => {
                // Check if transaction is reverted
                await expect(token.connect(deployer).transfer(receiver, tokens(100000000))).to.be.reverted
            })

            it('Reject invalid addresses', async () => {
                await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', tokens(1))).to.be.reverted
            })
        })
    })
})
