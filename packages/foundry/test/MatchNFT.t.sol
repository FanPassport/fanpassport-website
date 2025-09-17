// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../contracts/MatchNFT.sol";

contract MatchNFTTest is Test {
    MatchNFT public matchNFT;
    address public owner;
    address public user1;

    event MatchNFTMinted(uint256 indexed tokenId, address indexed recipient, string matchId);
    address public user2;

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);

        matchNFT = new MatchNFT();
    }

    function testDeployment() public {
        assertEq(matchNFT.name(), "MatchNFT");
        assertEq(matchNFT.symbol(), "MNFT");
        assertEq(matchNFT.owner(), owner);
    }

    function testMintMatchNFT() public {
        string memory matchId = "20250914-psg-lens";
        string memory competition = "ligue1";
        string memory kickoff = "2025-09-14T15:15:00Z";
        string memory venue = "parcdesprinces";
        string memory hometeam = "psg";
        string memory awayteam = "lens";
        string memory score = "2-0";
        string memory status = "finished";
        string memory tokenURI = "https://example.com/metadata/1.json";

        vm.expectEmit(true, true, false, true);
        emit MatchNFTMinted(1, user1, matchId);

        matchNFT.mintMatchNFT(
            user1,
            matchId,
            competition,
            kickoff,
            venue,
            hometeam,
            awayteam,
            score,
            status,
            tokenURI
        );

        assertEq(matchNFT.ownerOf(0), user1);
        assertEq(matchNFT.tokenURI(0), tokenURI);

        MatchNFT.MatchData memory data = matchNFT.getMatchData(0);
        assertEq(data.matchId, matchId);
        assertEq(data.competition, competition);
        assertEq(data.hometeam, hometeam);
        assertEq(data.awayteam, awayteam);
        assertEq(data.score, score);
        assertEq(data.status, status);
    }

    function testPreventDoubleClaim() public {
        string memory matchId = "20250914-psg-lens";

        matchNFT.mintMatchNFT(
            user1,
            matchId,
            "ligue1",
            "2025-09-14T15:15:00Z",
            "parcdesprinces",
            "psg",
            "lens",
            "2-0",
            "finished",
            "https://example.com/metadata/1.json"
        );

        vm.expectRevert("Match already claimed by this user");
        matchNFT.mintMatchNFT(
            user1,
            matchId,
            "ligue1",
            "2025-09-14T15:15:00Z",
            "parcdesprinces",
            "psg",
            "lens",
            "2-0",
            "finished",
            "https://example.com/metadata/2.json"
        );
    }

    function testAllowDifferentUsersSameMatch() public {
        string memory matchId = "20250914-psg-lens";

        matchNFT.mintMatchNFT(
            user1,
            matchId,
            "ligue1",
            "2025-09-14T15:15:00Z",
            "parcdesprinces",
            "psg",
            "lens",
            "2-0",
            "finished",
            "https://example.com/metadata/1.json"
        );

        // Different user should be able to claim the same match
        matchNFT.mintMatchNFT(
            user2,
            matchId,
            "ligue1",
            "2025-09-14T15:15:00Z",
            "parcdesprinces",
            "psg",
            "lens",
            "2-0",
            "finished",
            "https://example.com/metadata/2.json"
        );

        assertEq(matchNFT.ownerOf(0), user1);
        assertEq(matchNFT.ownerOf(1), user2);
    }

    function testOnlyOwnerCanMint() public {
        vm.prank(user1); // Switch to non-owner account

        vm.expectRevert("Ownable: caller is not the owner");
        matchNFT.mintMatchNFT(
            user1,
            "20250914-psg-lens",
            "ligue1",
            "2025-09-14T15:15:00Z",
            "parcdesprinces",
            "psg",
            "lens",
            "2-0",
            "finished",
            "https://example.com/metadata/1.json"
        );
    }

    function testHasUserClaimedMatch() public {
        string memory matchId = "20250914-psg-lens";

        assertFalse(matchNFT.hasUserClaimedMatch(user1, matchId));

        matchNFT.mintMatchNFT(
            user1,
            matchId,
            "ligue1",
            "2025-09-14T15:15:00Z",
            "parcdesprinces",
            "psg",
            "lens",
            "2-0",
            "finished",
            "https://example.com/metadata/1.json"
        );

        assertTrue(matchNFT.hasUserClaimedMatch(user1, matchId));
        assertFalse(matchNFT.hasUserClaimedMatch(user2, matchId));
    }
}