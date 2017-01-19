pragma solidity ^0.4.0;


import {PackageDB} from "./PackageDB.sol";
import {Authorized} from "./Authority.sol";


contract PackageIndex is Authorized {
  PackageDB public packageDb;

  function PackageIndex(address _packageDb) {
    if (_packageDb == 0x0) throw;
    packageDb = PackageDB(_packageDb);
  }


  modifier onlyPackageOwner(string name) {
    if (!packageDb.packageExists(name) || msg.sender == packageDb.getPackageOwner(name)) {
      _;
    } else {
      throw;
    }
  }

  //
  // Public Write API
  //
  function release(string name,
                   uint32 major,
                   uint32 minor,
                   uint32 patch,
                   string preRelease,
                   string build,
                   string releaseLockFileURI) public auth onlyPackageOwner(name) returns (bool) {
    if (versionExists(name, major, minor, patch, preRelease, build)) {
      // this version has already been released
      return false;
    }

    bytes32 nameHash = packageDb.hashName(name);
    bytes32 versionHash = packageDb.hashVersion(major, minor, patch, preRelease, build);

    if (!packageDb.versionExists(versionHash)) {
      packageDb.setVersion(major, minor, patch, preRelease, build);
    }

    // If this is the highest release in any of the three buckets, allow it.
    if (packageDb.isAnyLatest(nameHash, versionHash)) {
      if (!packageExists(name)) {
        packageDb.setPackageOwner(name, msg.sender);
      }

      packageDb.setRelease(name, major, minor, patch, preRelease, build, releaseLockFileURI);

      return true;
    } else {
      return false;
    }
  }

  function transferOwnership(string name,
                             address newOwner) public auth onlyPackageOwner(name) returns (bool) {
      return packageDb.setPackageOwner(name, newOwner);
  }

  //
  // Public Read API
  //

  /*
   *  Package Getters
   */
  function packageExists(string name) constant returns (bool) {
    return packageDb.packageExists(name);
  }

  function versionExists(string name,
                         uint32 major,
                         uint32 minor,
                         uint32 patch,
                         string preRelease,
                         string build) returns (bool) {
    return packageDb.releaseExists(name, major, minor, patch, preRelease, build);
  }

  function getOwner(string name) constant returns (address) {
    return packageDb.getPackageOwner(name);
  }

  function getNumReleases(string name) constant returns (uint) {
    return packageDb.getNumReleases(name);
  }

  /*
   *  Release Getters
   */
  function getRelease(bytes32 releaseHash) constant returns (uint32 major,
                                                             uint32 minor,
                                                             uint32 patch,
                                                             string preRelease,
                                                             string build,
                                                             string releaseLockFileURI) {
    (major, minor, patch) = packageDb.getMajorMinorPatch(releaseHash);
    preRelease = getPreRelease(releaseHash);
    build = getBuild(releaseHash);
    releaseLockFileURI = getReleaseLockileURI(releaseHash);
    return (major, minor, patch, preRelease, build, releaseLockFileURI);
  }

  function getRelease(string name, uint releaseIdx) constant returns (uint32 major,
                                                                      uint32 minor,
                                                                      uint32 patch,
                                                                      string preRelease,
                                                                      string build,
                                                                      string releaseLockFileURI) {
    bytes32 releaseHash = packageDb.getPackageReleaseHash(name, releaseIdx);
    return getRelease(releaseHash);
  }

  function getLatestVersion(string name) constant returns (uint32 major,
                                                           uint32 minor,
                                                           uint32 patch,
                                                           string preRelease,
                                                           string build,
                                                           string releaseLockFileURI) {
    bytes32 latestReleaseHash = packageDb.getLatestMajorTree(packageDb.hashName(name));
    return getRelease(latestReleaseHash);
  }

  function getAllReleaseHashes(string name) constant returns (bytes32[]) {
    uint numReleases = getNumReleases(name);
    bytes32[] memory releaseHashes = new bytes32[](numReleases);

    for (uint i = 0; i < numReleases; i++) {
      releaseHashes[i] = packageDb.getPackageReleaseHash(name, i);
    }

    return releaseHashes;
  }

  //
  // Private Internal API
  //
  function getReleaseLockileURI(bytes32 releaseHash) internal returns (string) {
    bytes4 sig = bytes4(sha3("getReleaseLockileURI(bytes32)"));
    return fetchString(sig, releaseHash);
  }

  function getPreRelease(bytes32 releaseHash) internal returns (string) {
    bytes4 sig = bytes4(sha3("getPreRelease(bytes32)"));
    return fetchString(sig, releaseHash);
  }

  function getBuild(bytes32 releaseHash) internal returns (string) {
    bytes4 sig = bytes4(sha3("getBuild(bytes32)"));
    return fetchString(sig, releaseHash);
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
