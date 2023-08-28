async function main() {
  console.log("Preparing deployment...\n")
  // Fetch contract to deploy
  const Token = await ethers.getContractFactory('Token') // ethers is js library that we use to deploy
  const Exchange = await ethers.getContractFactory('Exchange')

  // Fetch Accounts
  const accounts = await ethers.getSigners()
  // 1 for tokens & exchange deployer, 1 for fee account
  console.log(`Accounts fetched: \nToken 1 & 2 & 3 deployer: ${accounts[0].address}\nExchange owner/deployer: ${accounts[1].address}\n `)
  
  // Deploy contracts
  const token1 = await Token.deploy('Elektroniczna Zlotowka','ePLN', 1000000) // sends info away
  await token1.deploymentTransaction().wait(2); // wait to receive
  const token1_address = await token1.getAddress() // can just use token now instead of .getAddress?
  console.log(`Token1 Deployed to: ${token1_address}`)

  const token2= await Token.deploy('Elektronna Hryvnia','eUAH', 1000000) // sends info away
  await token2.deploymentTransaction().wait(2); // wait to receive
  const token2_address = await token2.getAddress() // can just use token now instead of .getAddress?
  console.log(`Token2 Deployed to: ${token2_address}`)

  const token3 = await Token.deploy('Fake Ethereum','fETH', 1000000) // sends info away
  await token3.deploymentTransaction().wait(2); // wait to receive
  const token3_address = await token3.getAddress() // can just use token now instead of .getAddress?
  console.log(`Token3 Deployed to: ${token3_address}`)

  const exchange = await Exchange.deploy(accounts[1].address, 10) // sends info away
  await exchange.deploymentTransaction().wait(2); // wait to receive
  const exchange_address = await exchange.getAddress() // can just use token now instead of .getAddress?
  console.log(`Exchange Deployed to: ${exchange_address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
