// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        string imageUrl;
        string description;
        uint voteCount;
    }

    struct Ballot {
        string title;
        string description;
        address creator;
        bool exists;
        uint candidateCount;
        mapping(uint => Candidate) candidates;
        mapping(address => bool) hasVoted;
    }

    mapping(string => Ballot) public ballots; // sessionCode => Ballot

    // Events
    event BallotCreated(string sessionCode, string title, string description, address creator);
    event CandidateAdded(string sessionCode, uint indexed id, string name, string imageUrl, string description);
    event VoteCast(string sessionCode, address indexed voter, uint indexed candidateId);
    event WinnerDeclared(string sessionCode, string name, uint votes);

    // Create a new ballot session with metadata
    function createBallot(string memory sessionCode, string memory _title, string memory _description) public {
        require(!ballots[sessionCode].exists, "Ballot with this session already exists");

        Ballot storage b = ballots[sessionCode];
        b.title = _title;
        b.description = _description;
        b.creator = msg.sender;
        b.exists = true;

        emit BallotCreated(sessionCode, _title, _description, msg.sender);
    }

    // Add candidate to a specific ballot session
    function addCandidate(
        string memory sessionCode,
        string memory _name,
        string memory _imageUrl,
        string memory _description
    ) public {
        Ballot storage b = ballots[sessionCode];
        require(b.exists, "Ballot does not exist");
        require(msg.sender == b.creator, "Only the creator can add candidates");

        uint id = b.candidateCount;
        b.candidates[id] = Candidate(id, _name, _imageUrl, _description, 0);
        b.candidateCount++;

        emit CandidateAdded(sessionCode, id, _name, _imageUrl, _description);
    }

    // Vote for a candidate in a specific ballot
    function vote(string memory sessionCode, uint candidateId) public {
        Ballot storage b = ballots[sessionCode];
        require(b.exists, "Ballot does not exist");
        require(!b.hasVoted[msg.sender], "You have already voted.");
        require(candidateId < b.candidateCount, "Invalid candidate ID");

        b.candidates[candidateId].voteCount++;
        b.hasVoted[msg.sender] = true;

        emit VoteCast(sessionCode, msg.sender, candidateId);
    }

    // Get candidate details from a specific ballot
    function getCandidate(string memory sessionCode, uint candidateId)
        public view returns (uint, string memory, string memory, string memory, uint)
    {
        Ballot storage b = ballots[sessionCode];
        require(b.exists, "Ballot does not exist");
        require(candidateId < b.candidateCount, "Invalid candidate ID");

        Candidate memory c = b.candidates[candidateId];
        return (c.id, c.name, c.imageUrl, c.description, c.voteCount);
    }

    // Get winner for a specific ballot
    function getWinner(string memory sessionCode) public view returns (string memory, uint) {
        Ballot storage b = ballots[sessionCode];
        require(b.exists, "Ballot does not exist");

        uint maxVotes = 0;
        uint winnerId = 0;

        for (uint i = 0; i < b.candidateCount; i++) {
            if (b.candidates[i].voteCount > maxVotes) {
                maxVotes = b.candidates[i].voteCount;
                winnerId = i;
            }
        }

        return (b.candidates[winnerId].name, maxVotes);
    }

    // Declare winner for frontend listeners
    function declareWinner(string memory sessionCode) public {
        (string memory winnerName, uint winnerVotes) = getWinner(sessionCode);
        emit WinnerDeclared(sessionCode, winnerName, winnerVotes);
    }

    // Get ballot metadata
    function getBallotMeta(string memory sessionCode) public view returns (string memory, string memory, address, uint) {
        Ballot storage b = ballots[sessionCode];
        require(b.exists, "Ballot does not exist");
        return (b.title, b.description, b.creator, b.candidateCount);
    }
}
