pragma solidity ^0.4.0;

import {PackageDB} from "./PackageDB.sol";

contract PackageIndex {
  PackageDB public packageDb;

  function PackageIndex(address _packageDb) {
    if (_packageDb == 0x0) throw;
    packageDb = PackageDB(_packageDb);
  }


  modifier onlyPackageOwner(string name) {
    if (!packageDb.packageExists(name) || msg.sender == packageDb.packageOwner(sha3(name))) {
      _;
    } else {
      throw;
    }
  }

  function release(string name,
                   uint32 major,
                   uint32 minor,
                   uint32 patch,
                   string preRelease,
                   string build,
                   string releaseLockFileURI) public onlyPackageOwner(name) returns (bool) {
    if (versionExists(name, major, minor, patch, preRelease, build)) {
      // this version has already been released
      return false;
    }

    // If this is the highest release in any of the three buckets, allow it.
    if (packageDb.isAnyLatest(name, major, minor, patch, preRelease, build)) {
      if (!packageExists(name)) {
        packageDb.setPackageOwner(name, msg.sender);
      }

      packageDb.setRelease(name, major, minor, patch, preRelease, build, releaseLockFileURI);

      return true;
    }
    return false;
  }

  function transferOwnership(string name,
                             address newOwner) onlyPackageOwner(name) returns (bool) {
      packageDb.setPackageOwner(name, newOwner);
  }

  function latestVersion(string name) constant returns (uint32 major,
                                                        uint32 minor,
                                                        uint32 patch,
                                                        string preRelease,
                                                        string build,
                                                        string releaseLockFileURI) {
    bytes32 latestVersionHash = packageDb.latestMajor(sha3(name));
    return getRelease(latestVersionHash);
  }

  function packageExists(string name) constant returns (bool) {
    return packageDb.packageExists(name);
  }

  function versionExists(string name,
                         uint32 major,
                         uint32 minor,
                         uint32 patch,
                         string preRelease,
                         string build) returns (bool) {
    return packageDb.versionExists(name, major, minor, patch, preRelease, build);
  }

  function getOwner(string name) constant returns (address) {
    return packageDb.packageOwner(sha3(name));
  }

  function numReleases(string name) constant returns (uint) {
    return packageDb.numReleases(name);
  }

  function getRelease(string name, uint releaseIdx) constant returns (uint32 major,
                                                                      uint32 minor,
                                                                      uint32 patch,
                                                                      string preRelease,
                                                                      string build,
                                                                      string releaseLockFileURI) {
    bytes32 versionHash = packageDb.packageVersionHashes(sha3(name), releaseIdx);
    return getRelease(versionHash);
  }

  function getReleases(string name) constant returns (bytes32[]) {
    bytes32 nameHash = sha3(name);

    uint numReleases = packageDb.numReleases(name);
    bytes32[] memory versionHashes = new bytes32[](numReleases);

    for (uint i = 0; i < numReleases; i++) {
      versionHashes[i] = packageDb.packageVersionHashes(nameHash, i);
    }

    return versionHashes;
  }

  function getReleaseLockFile(string name,
                              uint32 major,
                              uint32 minor,
                              uint32 patch,
                              string preRelease,
                              string build) constant returns (string) {
    bytes32 versionHash = sha3(name, major, minor, patch, preRelease, build);
    return getReleaseLockFile(versionHash);
  }

  function getPreRelease(string name,
                         uint32 major,
                         uint32 minor,
                         uint32 patch,
                         string preRelease,
                         string build) constant returns (string) {
    bytes32 versionHash = sha3(name, major, minor, patch, preRelease, build);
    return getPreRelease(versionHash);
  }

  function getBuild(string name,
                    uint32 major,
                    uint32 minor,
                    uint32 patch,
                    string preRelease,
                    string build) constant returns (string) {
    bytes32 versionHash = sha3(name, major, minor, patch, preRelease, build);
    return getBuild(versionHash);
  }

  function getRelease(bytes32 versionHash) constant returns (uint32 major,
                                                             uint32 minor,
                                                             uint32 patch,
                                                             string preRelease,
                                                             string build,
                                                             string releaseLockFileURI) {
    (major, minor, patch) = packageDb.getVersionNumbers(versionHash);
    preRelease = getPreRelease(versionHash);
    build = getBuild(versionHash);
    releaseLockFileURI = getReleaseLockFile(versionHash);
    return (major, minor, patch, preRelease, build, releaseLockFileURI);
  }

  function getPackageName(bytes32 versionHash) constant returns (string) {
    bytes4 sig = bytes4(sha3("getPackageName(bytes32)"));
    return fetchString(sig, versionHash);
  }

  function getReleaseLockFile(bytes32 versionHash) internal returns (string) {
    bytes4 sig = bytes4(sha3("releaseLockFiles(bytes32)"));
    return fetchString(sig, versionHash);
  }

  function getPreRelease(bytes32 versionHash) internal returns (string) {
    bytes4 sig = bytes4(sha3("getPreRelease(bytes32)"));
    return fetchString(sig, versionHash);
  }

  function getBuild(bytes32 versionHash) internal returns (string) {
    bytes4 sig = bytes4(sha3("getBuild(bytes32)"));
    return fetchString(sig, versionHash);
  }

  function fetchString(bytes4 sig, bytes32 arg) internal constant returns (string s) {
    address store = packageDb;
    bool success;

    assembly {
        let m := mload(0x40) //Free memory pointer
        mstore(m,sig)
        mstore(add(m,4), arg) // Write arguments to memory- align directly after function sig.
        success := call( //Fetch string size
            sub(gas,8000), // g
            store,         // a
            0,             // v
            m,             // in
            0x24,          // insize: 4 byte sig + 32 byte uint
            add(m,0x24),   // Out pointer: don't overwrite the call data, we need it again
            0x40           // Only fetch the first 64 bytes of the string data.
        )
        let l := mload(add(m,0x44)) // returned data stats at 0x24, length is stored in the second 32-byte slot
        success :=  and(success,call(sub(gas,4000),store, 0,
            m, // Reuse the same argument data
            0x24,
            m,  // We can overwrite the calldata now to save space
            add(l, 0x40) // The length of the returned data will be 64 bytes of metadata + string length
        ))
        s := add(m, mload(m)) // First slot points to the start of the string (will almost always be m+0x20)
        mstore(0x40, add(m,add(l,0x40))) //Move free memory pointer so string doesn't get overwritten
    }
    if(!success) throw;

    return s;
  }
}
