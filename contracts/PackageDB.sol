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

  // Package data
  mapping (bytes32 => string) public releaseLockFiles;
  mapping (bytes32 => string) public packageNames;
  mapping (bytes32 => Version[]) public packageVersions;
  mapping (bytes32 => uint) public packageVersionIds;
  mapping (bytes32 => address) public packageOwner;

  // Data for determining the latest releases in each bucket.
  mapping (bytes32 => uint32) public latestMajor; // sha3(name)
  mapping (bytes32 => uint32) public latestMinor; // sha3(name, major)
  mapping (bytes32 => uint32) public latestPatch; // sha3(name, major, minor);

  function setRelease(string name,
               uint32 major,
               uint32 minor,
               uint32 patch,
               string releaseLockFileURI) onlyOwner returns (bool) {

    // Hash the name and the version for storing data
    bytes32 nameHash = sha3(name);
    bytes32 versionHash = sha3(name, major, minor, patch);

    // Get the version id of the version we're trying to set.
    // If the version doesn't exist, that means we need to make room
    // for the version in the packageVersions array.
    // If it does exist, use its existing id.
    // Note that if the package doesn't exist, the version won't exist either.
    uint versionId = 0;

    if (!versionExists(name, major, minor, patch)) {
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

    bytes32 minorHash = sha3(name, major);
    bytes32 patchHash = sha3(name, major, minor);

    if (major > latestMajor[nameHash]) {
      latestMajor[nameHash] = major;
    }

    if (minor > latestMinor[minorHash]) {
      latestMinor[minorHash] = minor;
    }

    if (patch > latestPatch[patchHash]) {
      latestPatch[patchHash] = patch;
    }

    return true;
  }

  function setPackageOwner(string name, address newPackageOwner) onlyOwner {
    bytes32 nameHash = sha3(name);
    packageOwner[nameHash] = newPackageOwner;
  }

  function setOwner(address newOwner) onlyOwner {
    owner = newOwner;
  }

  function packageExists(string name) constant returns (bool) {
    bytes32 nameHash = sha3(name);
    return packageVersions[nameHash].length != 0;
  }

  function versionExists(string name, uint32 major, uint32 minor, uint32 patch) constant returns (bool) {
    bytes32 versionHash = sha3(name, major, minor, patch);
    return sha3(releaseLockFiles[versionHash]) != sha3("");
  }

  function numReleases(string name) constant returns (uint) {
    return packageVersions[sha3(name)].length;
  }
}
