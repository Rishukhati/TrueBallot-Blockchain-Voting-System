require("dotenv").config();
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.METAMASK_API_KEY}`);

async function checkConnection() {
    try {
        const blockNumber = await provider.getBlockNumber();
        console.log("Connected! Latest Block:", blockNumber);
    } catch (error) {
        console.error("Connection failed:", error);
    }
}

checkConnection();

