pragma solidity ^0.4.0;


import {PackageLib} from "contracts/PackageLib.sol";
import {PackageIndexInterface} from "contracts/PackageIndexInterface.sol";


contract PackageIndex {
    using PackageLib for PackageLib.Package;

    mapping (bytes32 => PackageLib.Package) packages;

    modifier onlyPackageOwner(bytes32 name) {
        if (msg.sender == packages[name].owner) {
            _;
        } else {
            throw;
        }
    }

    function register(bytes32 name) public returns (bool) {
        if (exists(name)) {
            return false;
        }

        packages[name].initialize(msg.sender, name);

        return true;
    }

    function release(bytes32 name,
                     uint32 major,
                     uint32 minor,
                     uint32 patch,
                     string releaseLockFileURI) public onlyPackageOwner(name) returns (bool) {
        if (major == 0 && minor == 0 && patch == 0) {
            return false;
        }
        var package = packages[name];

        return package.publishRelease(major, minor, patch, releaseLockFileURI);
    }

    function latestVersion(bytes32 name) constant returns (uint32 major,
                                                           uint32 minor,
                                                           uint32 patch,
                                                           string releaseLockFileURI) {
        var package = packages[name];
        bytes32 versionHash = sha3(package.latest.major, package.latest.minor, package.latest.patch);
        releaseLockFileURI = package.releaseLockFiles[versionHash];
        
        return (package.latest.major, package.latest.minor, package.latest.patch, releaseLockFileURI);
    }

    function exists(bytes32 name) constant returns (bool) {
        return (name != 0x0 && packages[name].name == name);
    }

    function getOwner(bytes32 name) constant returns (address) {
        return packages[name].owner;
    }

    function numReleases(bytes32 name) constant returns (uint) {
        return packages[name].releases.length;
    }

    function getRelease(bytes32 name, uint releaseIdx) constant returns (uint major,
                                                                         uint minor,
                                                                         uint patch,
                                                                         string releaseLockFileURI) {
        var package = packages[name];
        var version = package.releases[releaseIdx];
        var versionHash = sha3(version.major, version.minor, version.patch);
        releaseLockFileURI = package.releaseLockFiles[versionHash];
        return (version.major, version.minor, version.patch, releaseLockFileURI);
    }

    function getReleaseLockFile(bytes32 name,
                                uint major,
                                uint minor,
                                uint patch) constant returns (string) {
        bytes32 versionHash = sha3(major, minor, patch);
        return packages[name].releaseLockFiles[versionHash];
    }
}
