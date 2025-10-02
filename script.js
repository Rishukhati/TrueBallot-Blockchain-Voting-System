// View navigation functions
function nextView(current, next) {
    document.getElementById(current).classList.add('hidden');
    document.getElementById(next).classList.remove('hidden');
}

function prevView(current, previous) {
    document.getElementById(current).classList.add('hidden');
    document.getElementById(previous).classList.remove('hidden');
}



function addOption() {
    const container = document.getElementById('options-container');
    const optionCount = container.children.length;

    if (optionCount >= 5) {
        alert("You can only add up to 5 candidates.");
        return;
    }

    const div = document.createElement('div');
    div.className = 'space-y-4 p-4 border rounded-lg bg-gray-50 shadow-md';

    div.innerHTML = `
        <div class="flex items-center">
            <input type="text" placeholder="Candidate ${optionCount + 1} Name*" 
                   class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 candidate-name" required>
            <button type="button" class="ml-2 text-red-500 hover:text-red-700 remove-btn">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div>
            <textarea placeholder="Short description about this candidate (Optional)" 
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-20"></textarea>
        </div>
        <div>
            <label class="block text-gray-700 mb-1">Candidate Photo (Optional)</label>
            <input type="file" accept="image/*" class="w-full px-4 py-2 border rounded-lg">
        </div>
    `;

    container.appendChild(div);

    // Attach event listener for removal
    div.querySelector('.remove-btn').addEventListener('click', function () {
        div.remove();
    });
}


async function deployToBlockchain() {
    const uniqueCode = generateUniqueCode();
    const title = document.getElementById('ballot-title').value;
    const description = document.getElementById('ballot-description').value;

    if (!window.ethereum) {
        alert("Please install MetaMask to use this feature.");
        return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contractAddress = "0xAD56F2344b17fBA2b7dB03f103244DbfA8974f75"; // ✅ Your contract address

    const abi = [ // ✅ Your smart contract ABI (trimmed for readability)
        {
            "inputs": [
                { "internalType": "string", "name": "_code", "type": "string" },
                { "internalType": "string", "name": "_title", "type": "string" },
                { "internalType": "string", "name": "_description", "type": "string" }
            ],
            "name": "createBallot",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "candidateCount",
            "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
            "name": "candidates",
            "outputs": [
                { "internalType": "uint256", "name": "id", "type": "uint256" },
                { "internalType": "string", "name": "name", "type": "string" },
                { "internalType": "string", "name": "imageUrl", "type": "string" },
                { "internalType": "string", "name": "description", "type": "string" },
                { "internalType": "uint256", "name": "voteCount", "type": "uint256" }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                { "internalType": "string", "name": "_name", "type": "string" },
                { "internalType": "string", "name": "_imageUrl", "type": "string" },
                { "internalType": "string", "name": "_description", "type": "string" }
            ],
            "name": "addCandidate",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
            "name": "vote",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
        const tx = await contract.createBallot(uniqueCode, title, description);
        await tx.wait();

        const uniqueLink = `https://voting-platform.com/session/${uniqueCode}`;
        document.getElementById('unique-code').innerText = uniqueCode;
        document.getElementById('unique-link').href = uniqueLink;
        document.getElementById('unique-link').innerText = uniqueLink;
        document.getElementById('link-container').classList.remove('hidden');

    } catch (error) {
        console.error("❌ Error deploying ballot:", error);
        alert("Failed to deploy ballot. Check console.");
    }
}
const title = document.getElementById('ballotTitle').value;
const description = document.getElementById('ballotDescription').value;

// Save ballot details temporarily
const candidates = [];
document.querySelectorAll('#options-container .candidate-name').forEach(input => {
    candidates.push(input.value);
});

const ballotData = {
    title: title,
    description: description,
    candidates: candidates
};

localStorage.setItem('currentBallot', JSON.stringify(ballotData));

