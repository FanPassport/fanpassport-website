// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MatchNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    uint256 private _tokenIdCounter;

    struct MatchData {
        string matchId;
        string competition;
        string kickoff;
        string venue;
        string hometeam;
        string awayteam;
        string score;
        string status;
    }

    // Mapping from token ID to match data
    mapping(uint256 => MatchData) public matchData;

    // Mapping to track claimed matches per user
    mapping(address => mapping(string => bool)) public hasClaimedMatch;

    event MatchNFTMinted(uint256 indexed tokenId, address indexed recipient, string matchId);

    constructor() ERC721("MatchNFT", "MNFT") Ownable(msg.sender) {}

    /**
     * @dev Mint a match NFT for a user
     * @param recipient The address that will receive the NFT
     * @param matchId Unique identifier for the match
     * @param competition The competition name (e.g., "ligue1", "champions-league")
     * @param kickoff The kickoff date/time
     * @param venue The venue name
     * @param hometeam The home team name
     * @param awayteam The away team name
     * @param score The final score (can be empty for scheduled matches)
     * @param status The match status ("scheduled" or "finished")
     * @param _tokenURI The metadata URI for the NFT
     */
    function mintMatchNFT(
        address recipient,
        string memory matchId,
        string memory competition,
        string memory kickoff,
        string memory venue,
        string memory hometeam,
        string memory awayteam,
        string memory score,
        string memory status,
        string memory _tokenURI
    ) external {
        // Check if user has already claimed this match
        require(!hasClaimedMatch[recipient][matchId], "Match already claimed by this user");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        // Store match data
        matchData[tokenId] = MatchData({
            matchId: matchId,
            competition: competition,
            kickoff: kickoff,
            venue: venue,
            hometeam: hometeam,
            awayteam: awayteam,
            score: score,
            status: status
        });

        // Mark as claimed
        hasClaimedMatch[recipient][matchId] = true;

        // Mint the NFT
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        emit MatchNFTMinted(tokenId, recipient, matchId);
    }

    /**
     * @dev Get match data for a specific token
     * @param tokenId The token ID
     * @return MatchData struct containing all match information
     */
    function getMatchData(uint256 tokenId) external view returns (MatchData memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return matchData[tokenId];
    }

    /**
     * @dev Check if a user has claimed a specific match
     * @param user The user address
     * @param matchId The match ID
     * @return bool indicating if the match has been claimed
     */
    function hasUserClaimedMatch(address user, string memory matchId) external view returns (bool) {
        return hasClaimedMatch[user][matchId];
    }

    /**
     * @dev Override tokenURI to return the stored URI
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override supportsInterface
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Override _update to handle multiple inheritance
     */
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Override _increaseBalance to handle multiple inheritance
     */
    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    /**
     * @dev Get all token IDs owned by an address
     */
    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        for (uint256 i = 0; i < tokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        return tokenIds;
    }

    /**
     * @dev Burn function for token destruction (optional)
     */
    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender || getApproved(tokenId) == msg.sender || isApprovedForAll(ownerOf(tokenId), msg.sender), "Caller is not owner nor approved");
        _burn(tokenId);
        delete matchData[tokenId];
    }
}
