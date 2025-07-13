// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ExperienceNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _tokenIdCounter;
    mapping(uint256 => uint256) public experienceIds;

    event ExperienceNFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        uint256 indexed experienceId
    );

    constructor() ERC721("Experience NFT", "EXP") Ownable(msg.sender) {}

    function mintExperienceNFT(address to, uint256 experienceId) external {
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        
        experienceIds[newTokenId] = experienceId;
        
        _safeMint(to, newTokenId);
        
        emit ExperienceNFTMinted(to, newTokenId, experienceId);
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        uint256 experienceId = experienceIds[tokenId];
        if (experienceId == 0) {
            revert("ERC721: URI query for nonexistent token");
        }
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(_generateMetadata(tokenId, experienceId)))
        ));
    }

    function _generateMetadata(uint256 tokenId, uint256 experienceId) 
        private view returns (string memory) {
        
        string memory svg = _generateSVG(tokenId, experienceId);
        
        return string(abi.encodePacked(
            '{"name":"Experience #', experienceId.toString(), ' - Token #', tokenId.toString(), '",',
            '"description":"NFT reward for completing experience #', experienceId.toString(), '",',
            '"image":"data:image/svg+xml;base64,', _base64Encode(bytes(svg)), '",',
            '"attributes":[',
            '{"trait_type":"Experience ID","value":"', experienceId.toString(), '"},',
            '{"trait_type":"Token ID","value":"', tokenId.toString(), '"}',
            ']}'
        ));
    }

    function _generateSVG(uint256 tokenId, uint256 experienceId) 
        private view returns (string memory) {
        
        string memory backgroundColor = _generateColor(tokenId * 123 + experienceId * 456);
        string memory textColor = _generateColor(tokenId * 789 + experienceId * 321);
        string memory accentColor = _generateColor(tokenId * 654 + experienceId * 987);
        
        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">',
            '<defs>',
            '<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:', backgroundColor, ';stop-opacity:1" />',
            '<stop offset="100%" style="stop-color:', accentColor, ';stop-opacity:1" />',
            '</linearGradient>',
            '</defs>',
            '<rect width="400" height="400" fill="url(#grad1)" rx="20" ry="20"/>',
            '<circle cx="200" cy="120" r="60" fill="', textColor, '" opacity="0.8"/>',
            '<text x="200" y="130" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="white">EXP</text>',
            '<text x="200" y="200" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="', textColor, '">Experience #', experienceId.toString(), '</text>',
            '<text x="200" y="220" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="', textColor, '">Token #', tokenId.toString(), '</text>',
            '<text x="200" y="350" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="', textColor, '">FanAI Passport</text>',
            '</svg>'
        ));
    }

    function _generateColor(uint256 seed) private pure returns (string memory) {
        uint256 hue = seed % 360;
        uint256 saturation = 70 + (seed % 30);
        uint256 lightness = 50 + (seed % 20);
        
        return string(abi.encodePacked(
            "hsl(", hue.toString(), ",", saturation.toString(), "%,", lightness.toString(), "%)"
        ));
    }

    function _base64Encode(bytes memory data) private pure returns (string memory) {
        bytes memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 len = data.length;
        if (len == 0) return "";
        
        uint256 encodedLen = 4 * ((len + 2) / 3);
        bytes memory result = new bytes(encodedLen);
        
        uint256 i = 0;
        uint256 j = 0;
        
        while (i < len) {
            uint256 a = i < len ? uint8(data[i]) : 0;
            uint256 b = i + 1 < len ? uint8(data[i + 1]) : 0;
            uint256 c = i + 2 < len ? uint8(data[i + 2]) : 0;
            
            uint256 triple = (a << 16) + (b << 8) + c;
            
            result[j] = table[triple >> 18 & 63];
            result[j + 1] = table[triple >> 12 & 63];
            result[j + 2] = table[triple >> 6 & 63];
            result[j + 3] = table[triple & 63];
            
            i += 3;
            j += 4;
        }
        
        if (len % 3 == 1) {
            result[j - 2] = "=";
            result[j - 1] = "=";
        } else if (len % 3 == 2) {
            result[j - 1] = "=";
        }
        
        return string(result);
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    function getExperienceId(uint256 tokenId) public view returns (uint256) {
        uint256 experienceId = experienceIds[tokenId];
        if (experienceId == 0) {
            revert("Token does not exist");
        }
        return experienceId;
    }
} 