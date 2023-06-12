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
        receiver,
        exchange

    beforeEach(async () => {
        // Create test accounts
        accounts  = await ethers.getSigners()
        deployer = await accounts[0]
        receiver = await accounts[1]
        exchange = await accounts[2]

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
            expect(await token.name()).to.be.equal(name)
            console.log(`\t Token name: ${await token.name()}`)
        })
    
        it('Has the correct symbol', async () => {
    
            // Check that  symbol is correct
            expect(await token.symbol()).to.be.equal(symbol)
            console.log(`\t Token symbol: ${await token.symbol()}`)
        })
    
        it('Has the correct decimals', async () => {
    
            // Check that decimals is correct
            expect(await token.decimals()).to.be.equal(decimals)
            console.log(`\t Token decimals: ${await token.decimals()}`)
        })
    
        it('Has the correct total supply', async () => {
    
            // Check that supply is correct
            expect(await token.totalSupply()).to.be.equal(totalSupply)
            console.log(`\t Token supply: ${await token.totalSupply()}`)
        })

        it('Assigns token supply to deployer', async () => {
    
            // Check that supply is funded to deployer
            expect(await token.balanceOf(deployer)).to.be.equal(totalSupply)
            console.log(`\t Deployer balance: ${await token.balanceOf(deployer)}`)
        })
    })

    describe('Direct Token Transfer', () => {
        let amount, transaction, result, totalSupply

        describe('Test a valid transfer:', () => {

            beforeEach(async () => {
                amount = tokens(100)
                totalSupply = await token.totalSupply()

                // Log balances before transfer
                expect(await token.balanceOf(deployer)).to.be.equal(BigInt(totalSupply))
                console.log(`\t   Deployer balance before: ${await token.balanceOf(deployer)}`)

                expect(await token.balanceOf(receiver)).to.be.equal(0)
                console.log(`\t   Receiver balance before: ${await token.balanceOf(receiver)}`)

                // Make a token transfer
                
                transaction = await token.connect(deployer).transfer(receiver, amount) // connects deployer wallet to write to blockchain (pay the gas fee to sign  which prevents network spam)
                result = await transaction.wait() // wait for transaction to finish
            })

            it('Transfers token balance', async () => {
                // Log balances after transfer
                expect(await token.balanceOf(deployer)).to.be.equal(BigInt(totalSupply) - amount)
                console.log(`\t   Deployer balance after: ${await token.balanceOf(deployer)}`)

                expect(await token.balanceOf(receiver)).to.be.equal(amount)
                console.log(`\t   Receiver balance after: ${await token.balanceOf(receiver)}`)
            })

            it('Emits a transfer event', async () => {

                // Check event name
                expect(result.logs[0].fragment.name).to.be.equal('Transfer')
                console.log(`\t   Event Name: ${result.logs[0].fragment.name}`)

                // Check event details
                expect(result.logs[0].args.from).to.be.equal(await deployer.getAddress())
                console.log(`\t   Sender Address: ${result.logs[0].args.from}`)
                expect(result.logs[0].args.to).to.be.equal(await receiver.getAddress())
                console.log(`\t   Receiver Address: ${result.logs[0].args.to}`)
                expect(result.logs[0].args.value).to.be.equal(amount)
                console.log(`\t   Amount Sent: ${result.logs[0].args.value}`)
            })
        })

        describe('Test an invalid transfer:', () => {

            it('Rejects insufficient balance', async () => {
                // Check if transaction is reverted
                await expect(token.connect(deployer).transfer(receiver, tokens(100000000))).to.be.reverted
            })

            it('Reject invalid addresses', async () => {
                await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', tokens(1))).to.be.reverted
            })
        })
    })
    describe('Token Approval', () => {
        let amount, transaction, result

        beforeEach(async () => {
            amount = tokens(100)

            // Make a token transfer
            transaction = await token.connect(deployer).approve(exchange, amount) // connects deployer wallet to write to blockchain (pay the gas fee to sign which prevents network spam)
            result = await transaction.wait() // wait for transaction receipt
        })

        describe('Test a valid approval:', () => {

            it('Allocates an allowance for delegated token spending', async () => {
                expect(await token.allowance(deployer, exchange)).to.be.equal(amount)
            })

            it('Emits an approval event', async () => {

                // Check event name
                expect(result.logs[0].fragment.name).to.be.equal('Approval')
                console.log(`\t   Event Name: ${result.logs[0].fragment.name}`)

                // Check event details
                expect(result.logs[0].args.owner).to.be.equal(await deployer.getAddress())
                console.log(`\t   Owner Address: ${result.logs[0].args.owner}`)
                expect(result.logs[0].args.spender).to.be.equal(await exchange.getAddress())
                console.log(`\t   Spender Address: ${result.logs[0].args.spender}`)
                expect(result.logs[0].args.value).to.be.equal(amount)
                console.log(`\t   Amount Approved: ${result.logs[0].args.value}`)
            })
        })

        describe('Test an invalid approval:', () => {
            it('Rejects invalid spenders', async () => {
                await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
            })
        })
    })
    describe('Delegated Token Transfer', () => {
        let amount, transaction, result, totalSupply

        beforeEach(async () => {
            amount = tokens(100)
            totalSupply = await token.totalSupply()

            // Make a token transfer
            transaction = await token.connect(deployer).approve(exchange, amount) // connects deployer wallet to write to blockchain (pay the gas fee to sign which prevents network spam)
            result = await transaction.wait() // wait for transaction receipt
        })

        describe('Test a valid transfer:', () => {

            beforeEach(async () => {

                // Exchange facilitates one part of a swap
                transaction = await token.connect(exchange).transferFrom(deployer, receiver, amount)
                result = await transaction.wait()
            })

            it('Transfers token balance', async () => {

                // Log balances after transfer
                expect(await token.balanceOf(deployer)).to.be.equal(BigInt(totalSupply) - amount)
                console.log(`\t   Deployer balance after: ${await token.balanceOf(deployer)}`)

                expect(await token.balanceOf(receiver)).to.be.equal(amount)
                console.log(`\t   Receiver balance after: ${await token.balanceOf(receiver)}`)

            })

            it('Resets the allowance', async () => {
                expect(await token.allowance(deployer, exchange)).to.be.equal(0)
            })

            it('Emits a transfer event', async () => {

                // Check event name
                expect(result.logs[0].fragment.name).to.be.equal('Transfer')
                console.log(`\t   Event Name: ${result.logs[0].fragment.name}`)

                // Check event details
                expect(result.logs[0].args.from).to.be.equal(await deployer.getAddress())
                console.log(`\t   Sender Address: ${result.logs[0].args.from}`)
                expect(result.logs[0].args.to).to.be.equal(await receiver.getAddress())
                console.log(`\t   Receiver Address: ${result.logs[0].args.to}`)
                expect(result.logs[0].args.value).to.be.equal(amount)
                console.log(`\t   Amount Sent: ${result.logs[0].args.value}`)
            })
        })
        describe('Test an invalid transfer:', () => {
            it('Reject unapproved transfer', async () => {
                // Attempt to transfer too many tokens
                await expect(token.connect(exchange).transferFrom(deployer, receiver, tokens(10000000000))).to.be.reverted
            })
        })
    })
})
