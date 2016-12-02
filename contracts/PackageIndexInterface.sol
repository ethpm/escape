pragma solidity ^0.4.0;


import {PackageLib} from "contracts/PackageLib.sol";


contract PackageIndexInterface {
    mapping (bytes32 => PackageLib.Package) packages;

    modifier onlyPackageOwner(bytes32 name) {
        if (msg.sender == packages[name].owner) {
            _;
        } else {
            throw;
        }
    }

    function register(bytes32 name) public returns (bool);

    function release(bytes32 name,
                     uint32 major,
                     uint32 minor,
                     uint32 patch,
                     string releaseLockFileURI) public onlyPackageOwner(name) returns (bool);

    function latestVersion(bytes32 name) constant returns (uint32 major,
                                                           uint32 minor,
                                                           uint32 patch,
                                                           string releaseLockFileURI);

    function exists(bytes32 name) constant returns (bool);

    function getOwner(bytes32 name) constant returns (address);

    function numReleases(bytes32 name) constant returns (uint);

    function getRelease(bytes32 name, uint releaseIdx) constant returns (uint major,
                                                                         uint minor,
                                                                         uint patch,
                                                                         string releaseLockFileURI);

    function getReleaseLockFile(bytes32 name,
                                uint major,
                                uint minor,
                                uint patch) constant returns (string);
}
