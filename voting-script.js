let contract;
let accounts;
let chart = null;
const candidates = [];

const web3 = new Web3(window.ethereum);

// Connect to wallet
async function connectWallet() {
    if (window.ethereum) {
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const networkId = await web3.eth.net.getId();
        contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        document.getElementById('status').innerText = 'Connected';
        await loadCandidates();
    } else {
        alert("Please install MetaMask!");
    }
}

document.getElementById('connectBtn').addEventListener('click', connectWallet);

// Load candidates from the contract
async function loadCandidates() {
    const candidateCount = await contract.methods.candidateCount().call();
    candidates.length = 0;

    for (let i = 0; i < candidateCount; i++) {
        const [id, name, voteCount] = await contract.methods.getCandidate(i).call();
        candidates.push({
            id: parseInt(id),
            name,
            votes: parseInt(voteCount),
            color: getRandomColor()
        });
    }

    updateUI();
    initChart();
}

function getRandomColor() {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Voting logic
async function vote(candidateId) {
    if (!contract || !accounts || !accounts[0]) {
        alert("Please connect your wallet first.");
        return;
    }

    const hasVoted = await contract.methods.hasVoted(accounts[0]).call();
    if (hasVoted) {
        alert("You have already voted!");
        return;
    }

    try {
        await contract.methods.vote(candidateId).send({ from: accounts[0] });
        alert("Vote cast successfully!");
        await loadCandidates(); // Reload to reflect changes
    } catch (error) {
        console.error("Voting failed:", error);
        alert("Voting failed!");
    }
}

// Update UI vote counts
function updateUI() {
    candidates.forEach(c => {
        const el = document.getElementById(`count-${c.id}`);
        if (el) el.textContent = c.votes;
    });

    const total = candidates.reduce((sum, c) => sum + c.votes, 0);
    document.getElementById('total-votes').textContent = total;
    updateChart();
}

// Chart setup
function initChart() {
    const ctx = document.getElementById('votes-chart').getContext('2d');
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: candidates.map(c => c.name),
            datasets: [{
                data: candidates.map(c => c.votes),
                backgroundColor: candidates.map(c => c.color),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true },
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function updateChart() {
    if (!chart) return;
    chart.data.datasets[0].data = candidates.map(c => c.votes);
    chart.update();
}

// Add vote button event listeners
document.addEventListener('DOMContentLoaded', function () {
    for (let i = 1; i <= 5; i++) {
        const btn = document.getElementById(`voteBtn-${i}`);
        if (btn) {
            btn.addEventListener('click', () => vote(i));
        }
    }
});

const CONTRACT_ABI = [ 
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