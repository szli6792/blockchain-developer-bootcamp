async function main() {
  // Fetch contract to deploy
  const Token = await ethers.getContractFactory('Token') // ethers is js library that we use to deploy

  // Deploy contract
  const token = await Token.deploy() // sends info away
  await token.deploymentTransaction().wait(2); // wait to receive
  const token_address = await token.getAddress() // can just use token now instead of .getAddress?
  console.log(`Token Deployed to: ${token_address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
