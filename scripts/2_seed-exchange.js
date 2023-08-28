const hre = require("hardhat"); // Allows you to run script in terminal using node.js "node run" instead of "npx hardhat run"

const config = require('../src/config.json')

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether') // grab 1 million ether worth of wei
}

// timeout function to check for execution failure
const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {

    // Fetch network
    const {chainId} = await ethers.provider.getNetwork()
    console.log(`Current ChainId: ${chainId}`)

    // Fetch accounts
    const accounts = await ethers.getSigners()

    // Init Exchange on Local Blockchain
    const Exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address) // create smart contract for Exchange
    console.log(`Exchange Fetched: ${await Exchange.getAddress()}`)       

    // Init Token1 on Local Blockchain
    const Token1 = await ethers.getContractAt('Token', config[chainId].token1.address) // create smart contract for Token
    console.log(`Token1 Fetched: ${await Token1.getAddress()}`)
    
    // Init Token1 on Local Blockchain
    const Token2 = await ethers.getContractAt('Token', config[chainId].token2.address) // create smart contract for Token
    console.log(`Token2 Fetched:: ${await Token2.getAddress()}`)

    // Init Token1 on Local Blockchain
    const Token3 = await ethers.getContractAt('Token', config[chainId].token3.address) // create smart contract for Token
    console.log(`Token3 Fetched:: ${await Token3.getAddress()}`)
    
    // Setup to distribute tokens to exchange
    const deployer = accounts[0]
    const exchangeOwner = accounts[1]
    const trader1 = accounts[2]
    const trader2 = accounts[3]
    const trader3 = accounts[4]
    let amount = tokens(10000)
    //let amount2 = tokens(9000)
    let transaction, result

    // Fund trader1 with token1
    transaction = await Token1.connect(deployer).transfer(trader1, amount)
    console.log(`Transferred ${amount} tokens from ${await deployer.getAddress()} to ${await trader1.getAddress()}`)
    
    // Fund trader2 with token2
    transaction = await Token2.connect(deployer).transfer(trader2, amount)
    console.log(`Transferred ${amount} tokens from ${await deployer.getAddress()} to ${await trader2.getAddress()}`)

    // Fund trader3 with token3
    transaction = await Token3.connect(deployer).transfer(trader3, amount)
    console.log(`Transferred ${amount} tokens from ${await deployer.getAddress()} to ${await trader3.getAddress()}`)

    // Traders approve and deposits all tokens to the exchange
    transaction = await Token1.connect(trader1).approve(Exchange, amount)
    await transaction.wait()
    console.log(`Approved: ${amount} tokens from ${await trader1.address}`)

    transaction = await Exchange.connect(trader1).depositToken(Token1, amount)
    await transaction.wait()
    console.log(`Deposited: ${amount} ${await Token1.symbol()}tokens from ${await trader1.address}`)

    transaction = await Token2.connect(trader2).approve(Exchange, amount)
    await transaction.wait()
    console.log(`Approved: ${amount} tokens from ${await trader2.address}`)
   
    transaction = await Exchange.connect(trader2).depositToken(Token2, amount)
    await transaction.wait()
    console.log(`Deposited: ${amount} ${await Token2.symbol()}tokens from ${await trader2.address}`)

    transaction = await Token3.connect(trader3).approve(Exchange, amount)
    await transaction.wait()
    console.log(`Approved: ${amount} tokens from ${await trader3.address}`)

    transaction = await Exchange.connect(trader3).depositToken(Token3, amount)
    await transaction.wait()
    console.log(`Deposited: ${amount} ${await Token3.symbol()}tokens from ${await trader3.address}`)

    // SEED ORDER HISTORY

    // Seed a cancelled order:

    // Trader 1 makes
    transaction = await Exchange.connect(trader1).makeOrder(Token2, tokens(100), Token1, tokens(5))
    result = await transaction.wait()
    console.log(`Order #${await result.logs[0].args.id} made by ${await trader1.address}`)

    // Trader 1 cancelles
    transaction = await Exchange.connect(trader1).cancelOrder(result.logs[0].args.id)
    await transaction.wait()
    console.log(`Order #${await result.logs[0].args.id} cancelled by ${await trader1.address}`)
    
    // wait 1 second
    await wait(1) 

    // Seed filled order1:

    // Trader 1 makes
    transaction = await Exchange.connect(trader1).makeOrder(Token2, tokens(100), Token1, tokens(5))
    result = await transaction.wait()
    console.log(`Order #${await result.logs[0].args.id} made by ${await trader1.address}`)

    // Trader 2 takes
    transaction = await Exchange.connect(trader2).fillOrder(await result.logs[0].args.id)
    result = await transaction.wait()
    console.log(`Order #${await result.logs[0].args.id} filled by ${await trader2.address}`)

    // wait 1 second
    await wait(1)   

    // Seed filled order2:

    // Trader 1 makes
    transaction = await Exchange.connect(trader1).makeOrder(Token2, tokens(100), Token1, tokens(5))
    result = await transaction.wait()
    console.log(`Order #${await result.logs[0].args.id} made by ${await trader1.address}`)

    // Trader 2 takes
    transaction = await Exchange.connect(trader2).fillOrder(await result.logs[0].args.id)
    result = await transaction.wait()
    console.log(`Order #${await result.logs[0].args.id} filled by ${await trader2.address}`)

    // wait 1 second
    await wait(1) 

    // Seed filled order3:

    // Trader 1 makes
    transaction = await Exchange.connect(trader1).makeOrder(Token2, tokens(100), Token1, tokens(5))
    result = await transaction.wait()
    console.log(`Order #${await result.logs[0].args.id} made by ${await trader1.address}`)

    // Trader 2 takes
    transaction = await Exchange.connect(trader2).fillOrder(await result.logs[0].args.id)
    result = await transaction.wait()
    console.log(`Order #${await result.logs[0].args.id} filled by ${await trader2.address}`)

    // SEED ORDERBOOK

    // Trader 3 makes 10 orders below
    for(let i = 1; i <= 10; i++) {
      transaction = await Exchange.connect(trader3).makeOrder(Token2, tokens(10), Token3, tokens(10*i))
      result = await transaction.wait()
      console.log(`Order #${await result.logs[0].args.id} made by ${await trader3.address}`)

      // wait 1 second
      await wait(1)
    }

    // Trader 2 makes 10 orders above
    for(let i = 1; i <= 10; i++) {
      transaction = await Exchange.connect(trader2).makeOrder(Token3, tokens(10*i), Token2, tokens(10))
      result = await transaction.wait()
      console.log(`Order #${await result.logs[0].args.id} made by ${await trader2.address}`)

      // wait 1 second
      await wait(1)
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
});