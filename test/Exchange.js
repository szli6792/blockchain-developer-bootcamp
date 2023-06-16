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
        trader2,
        fundingAmount1 = tokens(100)
    
    const feePercent = 10

    beforeEach(async () => {

        // Init Exchange on Local Blockchain
        const Exchange = await ethers.getContractFactory('Exchange') // create smart contract for Exchange
        
        // Init Token1 on Local Blockchain
        const Token1 = await ethers.getContractFactory('Token') // create smart contract for Token

        // Init Token1 on Local Blockchain
        const Token2 = await ethers.getContractFactory('Token') // create smart contract for Token

        // Create test accounts
        accounts  = await ethers.getSigners()
        deployer = await accounts[0]
        feeAccount = await accounts[1]
        trader1 = await accounts[2]
        trader2 = await accounts[3]

        // Fetch Token1 from Local Blockchain 
        // (also deploys token1 totalSupply to deployer)
        token1 = await Token1.deploy('Elektroniczna Zlotowka','ePLN', 1000000) // sends smart contract away for deployment, gets receipt

        // Fetch Token2 from Local Blockchain 
        // (also deploys token1 totalSupply to deployer)
        token2 = await Token2.deploy('Elektronna hryvnia','eUAH', 1000000) // sends smart contract away for deployment, gets receipt


        // Give user1 some Token1
        let transaction = await token1.connect(deployer).transfer(trader1, fundingAmount1)
        await transaction.wait()

        // Fetch Exchange from Local Blockchain
        // (does this deploy to deployer?)
        exchange = await Exchange.deploy(feeAccount, feePercent) // sends smart contract away for deployment, gets receipt
        
        
    })

    describe('Deployment', () => {

        it('Tracks the fee account', async () => {

            // Check that fee account is tracked
            expect(await exchange.feeAccount()).to.be.equal(await feeAccount.getAddress())
            console.log(`\t Fee Account: ${await exchange.feeAccount()}`)
        })

        it('Tracks the fee percent', async () => {

            // Check that fee account is tracked
            expect(await exchange.feePercent()).to.be.equal(feePercent)
            console.log(`\t Fee Account: ${await exchange.feePercent()}`)
        })
    })

    describe('Depositing Tokens', () => {
        let amount, transaction, result //, totalSupply

        describe('Test Valid Deposit', () => {

            beforeEach(async () => {
                amount = tokens(10)
                // totalSupply = await token1.totalSupply()

                // Approve Token
                transaction = await token1.connect(trader1).approve(exchange, amount)
                await transaction.wait()
                // Deposit Token
                transaction = await exchange.connect(trader1).depositToken(token1, amount)
                result = await transaction.wait()
            })

            it('Tracks the token deposit', async () => {

                // Check exchange token balance
                expect(await token1.balanceOf(exchange)).to.be.equal(amount)

                // Check internal exchange token balance allocation
                expect(await exchange.tokenBalance(token1, trader1)).to.be.equal(amount)

                // Check function that wraps the above tokenBalance mapping
                expect(await exchange.balanceOf(token1, trader1)).to.be.equal(amount)
            })

            it('Emits a deposit event', async () => {

                // console.log(result.logs) // It logs two events (function within a function)

                // Check event name
                expect(result.logs[1].fragment.name).to.be.equal('Deposit')
                console.log(`\t   Event Name: ${result.logs[1].fragment.name}`)

                // Check event details
                expect(result.logs[1].args[0]).to.be.equal(await token1.getAddress())
                console.log(`\t   Token: ${result.logs[1].args[0]}`)
                expect(result.logs[1].args[1]).to.be.equal(await trader1.getAddress())
                console.log(`\t   Depositor: ${result.logs[1].args[1]}`)
                expect(result.logs[1].args[2]).to.be.equal(amount)
                console.log(`\t   Amount Deposited: ${result.logs[1].args[2]}`)
                expect(result.logs[1].args[3]).to.be.equal(amount)
                console.log(`\t   Token Balance: ${result.logs[1].args[3]}`)
            })
        })

        describe('Test Invalid Deposit', () => {

            it('Fails when no tokens are approved', async () => {
                await expect(exchange.connect(trader1).depositToken(token1, amount)).to.be.reverted
            })

        })
    })

    describe('Withdrawing Tokens', () => {
        let amount, transaction, result //, totalSupply

        describe('Test Valid Withdrawal', () => {

            beforeEach(async () => {
                amount1 = tokens(10)
                amount2 = tokens(8)
                amount3 = tokens(2) // 0 + 10 - 8 = 2
                // totalSupply = await token1.totalSupply()
                
                // WE FIRST NEED TOKENS TO DEPOSIT SOMETHING:
                // Approve Token
                transaction = await token1.connect(trader1).approve(exchange, amount1)
                await transaction.wait()

                // Deposit Token
                transaction = await exchange.connect(trader1).depositToken(token1, amount1)

                // NOW WE CAN WITHDRAW
                // Withdraw Token
                transaction = await exchange.connect(trader1).withdrawToken(token1, amount2)
                result = await transaction.wait()
            })

            it('Tracks the token withdrawal', async () => {

                // Check exchange token balance
                expect(await token1.balanceOf(exchange)).to.be.equal(amount3)

                // Check internal exchange token balance allocation
                expect(await exchange.tokenBalance(token1, trader1)).to.be.equal(amount3)

                // Check function that wraps the above tokenBalance mapping
                expect(await exchange.balanceOf(token1, trader1)).to.be.equal(amount3)
            })

            it('Emits a withdrawal event', async () => {

                // console.log(result.logs) // It logs two events (function within a function)

                // Check event name
                expect(result.logs[1].fragment.name).to.be.equal('Withdrawal')
                console.log(`\t   Event Name: ${result.logs[1].fragment.name}`)

                // Check event details
                expect(result.logs[1].args[0]).to.be.equal(await token1.getAddress())
                console.log(`\t   Token: ${result.logs[1].args[0]}`)
                expect(result.logs[1].args[1]).to.be.equal(await trader1.getAddress())
                console.log(`\t   Withdrawer: ${result.logs[1].args[1]}`)
                expect(result.logs[1].args[2]).to.be.equal(amount2)
                console.log(`\t   Amount Withdrawn: ${result.logs[1].args[2]}`)
                expect(result.logs[1].args[3]).to.be.equal(amount3)
                console.log(`\t   Token Balance: ${result.logs[1].args[3]}`)
            })
        })

        describe('Test Invalid Withdrawal', () => {

            it('Fails when insufficient balance', async () => {

                // No tokens to withdraw
                await expect(exchange.connect(trader1).withdrawToken(token1, amount1)).to.be.reverted
            })
        })
    })

    describe('Making Orders', () => {
        let transaction, result

        describe('Test Valid Order Creation', async () => {
            beforeEach(async () => {
                amount1 = tokens(10)
                amount2 = tokens(8)
                // totalSupply = await token1.totalSupply()
                
                // WE FIRST NEED TOKENS TO DEPOSIT SOMETHING:
                // Approve Token
                transaction = await token1.connect(trader1).approve(exchange, amount1)
                await transaction.wait()

                // Deposit Token
                transaction = await exchange.connect(trader1).depositToken(token1, amount1)

                // NOW WE CAN MAKE ORDER
                // Make an order
                transaction = await exchange.connect(trader1).makeOrder(token2, amount2, token1, amount2)
                result = await transaction.wait()
            })

            it('Tracks the newly created order', async () => {

                // Check if order cache was incremented
                expect(await exchange.orderCount()).to.be.equal(1)
            })

            it('Emits an Order event', async () => {

                // Check event name
                expect(result.logs[0].fragment.name).to.be.equal('Order')
                console.log(`\t   Event Name: ${result.logs[0].fragment.name}`)

                // Check event details
                expect(result.logs[0].args.id).to.be.equal(1)
                console.log(`\t   Order ID: ${result.logs[0].args.id}`)
                expect(result.logs[0].args.maker).to.be.equal(await trader1.getAddress())
                console.log(`\t   Order Maker: ${result.logs[0].args.maker}`)
                expect(result.logs[0].args.timestamp).to.be.at.least(1)
                console.log(`\t   Epoch Time: ${result.logs[0].args.timestamp}`)
                expect(result.logs[0].args.tokenGet).to.be.equal(await token2.getAddress())
                console.log(`\t   Buying Token: ${result.logs[0].args.tokenGet}`)
                expect(result.logs[0].args.amountGet).to.be.equal(amount2)
                console.log(`\t   Buying Amount: ${result.logs[0].args.amountGet}`)
                expect(result.logs[0].args.tokenGive).to.be.equal(await token1.getAddress())
                console.log(`\t   Selling Token: ${result.logs[0].args.tokenGive}`)
                expect(result.logs[0].args.amountGive).to.be.equal(amount2)
                console.log(`\t   Selling Amount: ${result.logs[0].args.amountGive}`)
            })

            describe('Order Actions', () => {
                describe('Test Order Cancelation', () => {
                    describe('Valid Cancelation', () => {
                        beforeEach(async () => {
                            transaction = await exchange.connect(trader1).cancelOrder(1)
                            result = await transaction.wait()
                        })

                        it('Updates Cancelled Orders', async () => {
                            expect(await exchange.orderCancelled(1)).to.be.equal(true)
                        })

                        it('Emits a Cancel event', async () => {

                            // Check event name
                            expect(result.logs[0].fragment.name).to.be.equal('Cancel')
                            console.log(`\t   Event Name: ${result.logs[0].fragment.name}`)
            
                            // Check event details
                            expect(result.logs[0].args.id).to.be.equal(1)
                            console.log(`\t   Order ID: ${result.logs[0].args.id}`)
                            expect(result.logs[0].args.maker).to.be.equal(await trader1.getAddress())
                            console.log(`\t   Order Maker: ${result.logs[0].args.maker}`)
                            expect(result.logs[0].args.timestamp).to.be.at.least(1)
                            console.log(`\t   Epoch Time: ${result.logs[0].args.timestamp}`)
                            expect(result.logs[0].args.tokenGet).to.be.equal(await token2.getAddress())
                            console.log(`\t   Buying Token: ${result.logs[0].args.tokenGet}`)
                            expect(result.logs[0].args.amountGet).to.be.equal(amount2)
                            console.log(`\t   Buying Amount: ${result.logs[0].args.amountGet}`)
                            expect(result.logs[0].args.tokenGive).to.be.equal(await token1.getAddress())
                            console.log(`\t   Selling Token: ${result.logs[0].args.tokenGive}`)
                            expect(result.logs[0].args.amountGive).to.be.equal(amount2)
                            console.log(`\t   Selling Amount: ${result.logs[0].args.amountGive}`)
                        })
                    })
                    describe('Invalid Cancelation', () => {
                        it('Does not cancel unmade orders', async () => {
                            await expect(exchange.connect(trader1).cancelOrder(99)).to.be.reverted
                        })
                        it('Only maker can cancel their order', async () => {
                            await expect(exchange.connect(trader2).cancelOrder(1)).to.be.reverted
                        })
                    })
                })
    
                describe('Filling Order', () => {
                
                })
            })
        })

        describe('Test Invalid Order Creation', async () => {

            it('Fails when insufficient balance', async () => {

                // No tokens to order with
                await expect(exchange.connect(trader1).makeOrder(token2, amount2, token1, amount2)).to.be.reverted
            })
        })
    })
})
