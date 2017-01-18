pragma solidity ^0.4.0;


contract PackageDB {
  address public owner;

  function PackageDB() {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    if (msg.sender == owner) {
      _;
    } else {
      throw;
    }
  }

  struct Version {
    uint32 major;
    uint32 minor;
    uint32 patch;
    string preRelease;
    string build;
  }

  /*
   * Package data 
   */
  // (nameHash => value)
  mapping (bytes32 => bool) _packageExists;
  mapping (bytes32 => string) public packageNames;
  mapping (bytes32 => address) public packageOwner;
  mapping (bytes32 => bytes32[]) public packageVersionHashes;
  // (versionHash => value)
  mapping (bytes32 => Version) public packageVersions;
  mapping (bytes32 => bool) _versionExists;
  mapping (bytes32 => string) public releaseLockFiles;

  function setRelease(string name,
                      uint32 major,
                      uint32 minor,
                      uint32 patch,
                      string preRelease,
                      string build,
                      string releaseLockFileURI) onlyOwner returns (bool) {

    // Hash the name and the version for storing data
    bytes32 nameHash = sha3(name);
    bytes32 versionHash = sha3(name, major, minor, patch, preRelease, build);

    // Mark the package as existing if it isn't already tracked.
    if (!_packageExists[nameHash]) {
        packageNames[nameHash] = name;
        _packageExists[nameHash] = true;
    }

    // If this is a new version push it onto the array of version hashes for
    // this package.
    if (!_versionExists[versionHash]) {
      packageVersionHashes[nameHash].push(versionHash);
      _versionExists[versionHash] = true;
    }

    // Store the release data.
    packageVersions[versionHash] = Version({
      major: major,
      minor: minor,
      patch: patch,
      preRelease: preRelease,
      build: build
    });
    releaseLockFiles[versionHash] = releaseLockFileURI;

    return true;
  }

  function setPackageOwner(string name, address newPackageOwner) onlyOwner {
    bytes32 nameHash = sha3(name);
    packageOwner[nameHash] = newPackageOwner;
  }

  function packageExists(string name) constant returns (bool) {
    bytes32 nameHash = sha3(name);
    return _packageExists[nameHash];
  }

  function versionExists(string name,
                         uint32 major,
                         uint32 minor,
                         uint32 patch,
                         string preRelease,
                         string build) constant returns (bool) {
    bytes32 versionHash = sha3(name, major, minor, patch, preRelease, build);
    return versionExists(versionHash);
  }

  function versionExists(bytes32 versionHash) internal returns (bool) {
    return _versionExists[versionHash];
  }

  function numReleases(string name) constant returns (uint) {
    return packageVersionHashes[sha3(name)].length;
  }

  /*
   *  Administrative API
   */
  function setOwner(address newOwner) onlyOwner {
    owner = newOwner;
  }
}
