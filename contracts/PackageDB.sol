pragma solidity ^0.4.0;

import {SemVersionLib} from "./SemVersionLib.sol";


contract PackageDB {
  using SemVersionLib for SemVersionLib.SemVersion;
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

  /*
   * Package data 
   */
  // (nameHash => value)
  mapping (bytes32 => bool) _packageExists;
  mapping (bytes32 => string) public packageNames;
  mapping (bytes32 => address) public packageOwner;
  mapping (bytes32 => bytes32[]) public packageVersionHashes;
  // (versionHash => value)
  mapping (bytes32 => SemVersionLib.SemVersion) public packageVersions;
  mapping (bytes32 => bytes32) versionHashReverseLookup;
  mapping (bytes32 => bool) _versionReleased;
  mapping (bytes32 => bool) _versionPopulated;
  mapping (bytes32 => string) public releaseLockFiles;

  event PackageReleased(bytes32 indexed versionHash);
  event PackageOwnerChanged(address indexed oldOwner, address indexed newOwner);

  /*
   * Latest version by latest version number.
   */

  // (nameHash => versionHash);
  mapping (bytes32 => bytes32) public latestMajor;

  // (nameHash => major => versionHash);
  mapping (bytes32 => mapping(uint32 => bytes32)) public latestMinor;

  // (nameHash => major => minor => versionHash);
  mapping (bytes32 => mapping (uint32 => mapping(uint32 => bytes32))) public latestPatch;

  // (nameHash => major => minor => patch => versionHash);
  mapping (bytes32 => mapping (uint32 => mapping(uint32 => mapping (uint32 => bytes32)))) public latestPreRelease;

  function setRelease(string name,
                      uint32 major,
                      uint32 minor,
                      uint32 patch,
                      string preRelease,
                      string build,
                      string releaseLockFileURI) onlyOwner public returns (bool) {

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
    if (!_versionReleased[versionHash]) {
      packageVersionHashes[nameHash].push(versionHash);
      _versionReleased[versionHash] = true;
    }

    // Populate the version data.
    if (!_versionPopulated[versionHash]) {
        packageVersions[versionHash].init(major, minor, patch, preRelease, build);
        _versionPopulated[versionHash] = true;
        versionHashReverseLookup[versionHash] = nameHash;
    }

    // Save the release lockfile URI
    releaseLockFiles[versionHash] = releaseLockFileURI;

    // Track latest released versions for each branch of the release tree.
    if (packageVersions[versionHash].isGreater(packageVersions[latestMajor[nameHash]])) {
        latestMajor[nameHash] = versionHash;
    }
    if (packageVersions[versionHash].isGreater(packageVersions[latestMinor[nameHash][major]])) {
        latestMinor[nameHash][major] = versionHash;
    }
    if (packageVersions[versionHash].isGreater(packageVersions[latestPatch[nameHash][major][minor]])) {
        latestPatch[nameHash][major][minor] = versionHash;
    }
    if (packageVersions[versionHash].isGreater(packageVersions[latestPatch[nameHash][major][minor][patch]])) {
        latestPreRelease[nameHash][major][minor][patch] = versionHash;
    }

    // Log the release.
    PackageReleased(versionHash);

    return true;
  }

  function setPackageOwner(string name,
                           address newPackageOwner) onlyOwner public returns (bool) {
    bytes32 nameHash = sha3(name);
    PackageOwnerChanged(packageOwner[nameHash], newPackageOwner);
    packageOwner[nameHash] = newPackageOwner;
  }

  /*
   *  Constant Getters
   */
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
    return _versionReleased[versionHash];
  }

  function numReleases(string name) constant returns (uint) {
    return packageVersionHashes[sha3(name)].length;
  }

  function isAnyLatest(string name,
                       uint32 major,
                       uint32 minor,
                       uint32 patch,
                       string preRelease,
                       string build) constant returns (bool) {
    bytes32 nameHash = sha3(name);
    bytes32 versionHash = sha3(name, major, minor, patch, preRelease, build);

    if (!_versionPopulated[versionHash]) {
        packageVersions[versionHash].init(major, minor, patch, preRelease, build);
        _versionPopulated[versionHash] = true;
        versionHashReverseLookup[versionHash] = nameHash;
    }

    var _version = packageVersions[versionHash];

    if (_version.isGreater(packageVersions[versionHash])) {
        return true;
    } else if (_version.isGreater(packageVersions[latestMajor[nameHash]])) {
        return true;
    } else if (_version.isGreater(packageVersions[latestMajor[nameHash][major]])) {
        return true;
    } else if (_version.isGreater(packageVersions[latestMajor[nameHash][major][minor]])) {
        return true;
    } else {
        return false;
    }
  }

  function getVersionNumbers(bytes32 versionHash) constant returns (uint32, uint32, uint32) {
      var version = packageVersions[versionHash];
      return (version.major, version.minor, version.patch);
  }

  function getPackageName(bytes32 versionHash) constant returns (string) {
      return packageNames[versionHashReverseLookup[versionHash]];
  }

  function getPreRelease(bytes32 versionHash) constant returns (string) {
      return packageVersions[versionHash].preRelease;
  }

  function getBuild(bytes32 versionHash) constant returns (string) {
      return packageVersions[versionHash].build;
  }

  /*
   *  Administrative API
   */
  function setOwner(address newOwner) onlyOwner {
    owner = newOwner;
  }
}
