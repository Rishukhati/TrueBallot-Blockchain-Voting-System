const hre = require("hardhat");

async function main() {
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(); // Deploy contract

    await voting.waitForDeployment(); // Correct in Ethers v6

    const contractAddress = await voting.getAddress(); // Get deployed contract address
    console.log("Contract deployed at:", contractAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
