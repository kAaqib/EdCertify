// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateRegistry {
    address public owner;
    
    // Mapping to store certificate hashes
    mapping(uint256 => string) private certificateHashes;
    
    event CertificateHashStored(uint256 certificateId, string certificateHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Function to store a certificate hash
    function storeCertificateHash(uint256 certificateId, string memory certificateHash) public onlyOwner {
        certificateHashes[certificateId] = certificateHash;
        emit CertificateHashStored(certificateId, certificateHash);
    }

    // Function to retrieve the stored certificate hash
    function getStoredCertificateHash(uint256 certificateId) public view returns (string memory) {
        return certificateHashes[certificateId];
    }
}