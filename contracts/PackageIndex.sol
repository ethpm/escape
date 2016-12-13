pragma solidity ^0.4.0;

import {PackageDB} from "./PackageDB.sol";

contract PackageIndex {
  PackageDB public packageDb;

  function PackageIndex(PackageDB _packageDb) {
    if (address(_packageDb) == 0) {
      _packageDb = new PackageDB();
    }

    packageDb = _packageDb;
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
                   string releaseLockFileURI) public onlyPackageOwner(name) returns (bool) {

    bool versionExists = packageDb.versionExists(name, major, minor, patch);
    bool packageExists = packageDb.packageExists(name);

    if (versionExists) {
      // this version has already been released
      return false;
    }

    bytes32 majorHash = sha3(name);
    bytes32 minorHash = sha3(name, major);
    bytes32 patchHash = sha3(name, major, minor);

    // If this is the highest release in any of the three buckets, allow it.
    if (major > packageDb.latestMajor(majorHash) ||
        minor > packageDb.latestMinor(minorHash) ||
        patch > packageDb.latestPatch(patchHash)) {
      packageDb.setRelease(name, major, minor, patch, releaseLockFileURI);

      if (!packageExists) {
        packageDb.setOwner(msg.sender);
      }

      return true;
    }
    return false;
  }

  function latestVersion(string name) constant returns (uint32 major,
                                                         uint32 minor,
                                                         uint32 patch,
                                                         string releaseLockFileURI) {
    major = packageDb.latestMajor(sha3(name));
    minor = packageDb.latestMinor(sha3(name, major));
    patch = packageDb.latestPatch(sha3(name, major, minor));
    return (major, minor, patch, getReleaseLockFile(name, major, minor, patch));
  }

  function packageExists(string name) constant returns (bool) {
    return packageDb.packageExists(name);
  }

  function versionExists(string name, uint32 major, uint32 minor, uint32 patch) returns (bool) {
    return packageDb.versionExists(name, major, minor, patch);
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
                                                                       string releaseLockFileURI) {
    (major, minor, patch) = packageDb.packageVersions(sha3(name), releaseIdx);
    return (major, minor, patch, getReleaseLockFile(name, major, minor, patch));
  }

  function getReleaseLockFile(string name,
                              uint32 major,
                              uint32 minor,
                              uint32 patch) constant returns (string s) {
    // These variables are named suchly that I can copy and paste the code below.
    // (i.e., somebody else wrote this)
    bytes32 i = sha3(name, major, minor, patch);
    address store = packageDb;
    string memory fn = "releaseLockFiles(bytes32)";

    // Let's return some baddass strings y'all!
    bytes4 sig = bytes4(sha3(fn));
    bool success;
    assembly {
        let m := mload(0x40) //Free memory pointer
        mstore(m,sig)
        mstore(add(m,4), i) // Write arguments to memory- align directly after function sig.
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
  }

  function getReleases(string name) constant returns (uint32[3][]) {
    bytes32 nameHash = sha3(name);
    uint32 major;
    uint32 minor;
    uint32 patch;

    uint numReleases = packageDb.numReleases(name);
    uint32[3][] memory ret = new uint32[3][](numReleases);

    for (uint i = 0; i < numReleases; i++) {
      (major, minor, patch) = packageDb.packageVersions(nameHash, i);
      uint32[3] memory version;
      version[0] = major;
      version[1] = minor;
      version[2] = patch;
      ret[i] = version;
    }

    return ret;
  }

  function getReleases(string name, uint index) constant returns (uint32[3]) {
    bytes32 nameHash = sha3(name);
    uint32 major;
    uint32 minor;
    uint32 patch;
    (major, minor, patch) = packageDb.packageVersions(nameHash, index);

    uint32[3] memory version;
    version[0] = major;
    version[1] = minor;
    version[2] = patch;
    return version;
  }
}
