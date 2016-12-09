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
  }

  mapping (bytes32 => string) public releaseLockFiles;
  mapping (bytes32 => string) public packageNames;
  mapping (bytes32 => Version[]) public packageVersions;
  mapping (bytes32 => uint) public packageVersionIds;
  mapping (bytes32 => address) public packageOwner;

  function setRelease(string name,
               uint32 major,
               uint32 minor,
               uint32 patch,
               string releaseLockFileURI) onlyOwner {

    // Hash the name and the version for storing data
    bytes32 nameHash = sha3(name);
    bytes32 versionHash = sha3(name, major, minor, patch);

    // Check existence of the version we're trying to set
    bool versionExists = sha3(releaseLockFiles[versionHash]) != sha3("");

    // Get the version id of the version we're trying to set.
    // If the version doesn't exist, that means we need to make room
    // for the version in the packageVersions array.
    // If it does exist, use its existing id.
    // Note that if the package doesn't exist, the version won't exist either.
    uint versionId = 0;

    if (!versionExists) {
      versionId = packageVersions[nameHash].length;
      packageVersions[nameHash].length += 1;
    } else {
      versionId = packageVersionIds[versionHash];
    }

    // Now store all the data
    releaseLockFiles[versionHash] = releaseLockFileURI;
    packageNames[nameHash] = name;
    packageVersions[nameHash][versionId] = Version({
      major: major,
      minor: minor,
      patch: patch
    });
    packageVersionIds[versionHash] = versionId;
  }

  function setPackageOwner(string name, address newPackageOwner) onlyOwner {
    bytes32 nameHash = sha3(name);
    packageOwner[nameHash] = newPackageOwner;
  }

  function setOwner(address newOwner) onlyOwner {
    owner = newOwner;
  }
}
