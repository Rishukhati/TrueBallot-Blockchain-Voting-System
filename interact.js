const hre = require("hardhat");

async function main() {
    const contractAddress = "0xfE12bF25cc32e3C4F92494c1F9182c97cA43d363"; // Your contract address

    // Attach to deployed contract
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.attach(contractAddress);

    // Add a candidate
    const tx = await voting.addCandidate("Rishabh");
    await tx.wait();
    console.log("Added candidate: Rishabh");

    // Fetch and log total candidates correctly
    const totalCandidates = await voting.candidateCount();
    console.log("Total Candidates:", totalCandidates.toString());

    // Fetch candidate details
    const candidate = await voting.getCandidate(0);
    console.log("Candidate:", candidate);
}

// Error handling
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
