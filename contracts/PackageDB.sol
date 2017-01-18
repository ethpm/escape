pragma solidity ^0.4.0;

import {SemVersionLib} from "./SemVersionLib.sol";
import {Authorized} from "./Authority.sol";


contract PackageDB is Authorized {
  using SemVersionLib for SemVersionLib.SemVersion;

  /*
   * Package data 
   */
  // (nameHash => value)
  mapping (bytes32 => bool) _packageExists;
  mapping (bytes32 => string) public packageNames;
  mapping (bytes32 => address) public packageOwner;
  mapping (bytes32 => bytes32[]) public packageReleaseHashes;
  // (releaseHash => value)
  mapping (bytes32 => bytes32) _releaseVersionLookup
  mapping (bytes32 => bytes32) _releasePackageNameLookup;
  mapping (bytes32 => bool) _releaseExists;
  mapping (bytes32 => string) public releaseLockFiles;
  // (releaseHash => value)
  mapping (bytes32 => SemVersionLib.SemVersion) _recordedVersions;
  mapping (bytes32 => bool) _versionExists;

  event PackageReleased(bytes32 indexed versionHash);
  event PackageOwnerChanged(address indexed oldOwner, address indexed newOwner);

  /*
   * Latest version tracking for each branch of the release tree.
   */

  // (nameHash => versionHash);
  mapping (bytes32 => bytes32) _latestMajor;

  // (nameHash => major => versionHash);
  mapping (bytes32 => mapping(uint32 => bytes32)) _latestMinor;

  // (nameHash => major => minor => versionHash);
  mapping (bytes32 => mapping (uint32 => mapping(uint32 => bytes32))) _latestPatch;

  // (nameHash => major => minor => patch => versionHash);
  mapping (bytes32 => mapping (uint32 => mapping(uint32 => mapping (uint32 => bytes32)))) _latestPreRelease;

  function setRelease(string name,
                      uint32 major,
                      uint32 minor,
                      uint32 patch,
                      string preRelease,
                      string build,
                      string releaseLockFileURI) auth public returns (bool) {

    // Hash the name and the version for storing data
    bytes32 nameHash = sha3(name);
    bytes32 releaseHash = sha3(name, major, minor, patch, preRelease, build);

    // Mark the package as existing if it isn't already tracked.
    if (!_packageExists[nameHash]) {
        packageNames[nameHash] = name;
        _packageExists[nameHash] = true;
    }

    // If this is a new version push it onto the array of version hashes for
    // this package.
    if (!_releaseExists[releaseHash]) {
      packageReleaseHashes[nameHash].push(releaseHash);
      _releaseExists[releaseHash] = true;
    }

    // Save a mapping from releaseHash to versionHash
    _releaseVersionLookup[releaseHash] = setVersion(major, minor, patch, preRelease, build);

    // Save the release lockfile URI
    releaseLockFiles[releaseHash] = releaseLockFileURI;

    // Track latest released versions for each branch of the release tree.
    updateMajorTree(releaseHash);
    updateMinorTree(releaseHash);
    updatePatchTree(releaseHash);
    updatePreReleaseTree(releaseHash);

    // Log the release.
    PackageReleased(versionHash);

    return true;
  }

  function removeRelease(string name, uint idx) auth public returns (bool) {
      bytes32 nameHash = sha3(name);
      if (idx >= packageVersions[nameHash].length) {
          return false;
      }
      bytes32 versionHash = packageVersions[nameHash][idx];

      delete _versionReleased[versionHash];
      delete releaseLockFiles[versionHash];
      delete versionHashReverseLookup[versionHash];
      delete packageVersions[versionHash];

      // Move the last item in the list of version hashes into the slot being
      // removed and then shorten the array length by 1.
      packageVersions[nameHash][idx] = packageVersions[nameHash][packageVersions[nameHash].length - 1];
      packageVersions[nameHash].length -= 1;
  }

  function setVersion(uint32 major,
                      uint32 minor,
                      uint32 patch,
                      string preRelease,
                      string build) public returns (bytes32) {
    bytes32 versionHash = sha3(major, minor, patch, preRelease, build);

    // Populate the version data.
    if (!_versionExists[versionHash]) {
        __recordedVersions[versionHash].init(major, minor, patch, preRelease, build);
        _versionExists[versionHash] = true;
    }
    return versionHash;
  }

  function setPackageOwner(string name,
                           address newPackageOwner) auth public returns (bool) {
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

  function releaseExists(string name,
                         uint32 major,
                         uint32 minor,
                         uint32 patch,
                         string preRelease,
                         string build) constant returns (bool) {
    bytes32 releaseHash = sha3(name, major, minor, patch, preRelease, build);
    return releaseExists(releaseHash);
  }

  function numReleases(string name) constant returns (uint) {
    return packageReleaseHashes[sha3(name)].length;
  }

  function isAnyLatest(string name,
                       uint32 major,
                       uint32 minor,
                       uint32 patch,
                       string preRelease,
                       string build) constant returns (bool) {
    bytes32 nameHash = sha3(name);
    bytes32 releaseHash = sha3(name, major, minor, patch, preRelease, build);

    var version = _recordedVersions[setVersion(major, minor, patch, preRelease, build)];

    if (version.isGreater(_recordedVersions[_latestMajor[versionHash])) {
        return true;
    } else if (version.isGreater(_recordedVersions[_latestMajor[nameHash]])) {
        return true;
    } else if (version.isGreater(_recordedVersions[_latestMajor[nameHash][major]])) {
        return true;
    } else if (version.isGreater(_recordedVersions[_latestMajor[nameHash][major][minor]])) {
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

  //
  // +--------------+
  // | Internal API |
  // +--------------+
  //

  /*
   *  Tracking of latest releases for each branch of the release tree.
   */

  function updateMajorTree(bytes32 releaseHash) internal returns (bool) {
    bytes32 nameHash = _releasePackageNameLookup[releaseHash];
    var version = _recordedVersions[_releaseVersionLookup[releaseHash]];
    var latestMajor = _recordedVersions[_releaseVersionLookup[_latestMajor[nameHash]]];

    if (version.isGreaterOrEqual(latestMajor)) {
        _latestMajor[nameHash] = releaseHash;
        return true;
    } else {
        return false;
    }
  }

  function updateMinorTree(bytes32 releaseHash) internal returns (bool) {
    bytes32 nameHash = _releasePackageNameLookup[releaseHash];
    var version = _recordedVersions[_releaseVersionLookup[releaseHash]];
    var latestMinor = _recordedVersions[_releaseVersionLookup[_latestMinor[nameHash][version.major]]];

    if (version.isGreaterOrEqual(latestMinor)) {
        _latestMinor[nameHash] = releaseHash;
        return true;
    } else {
        return false;
    }
  }

  function updatePatchTree(bytes32 releaseHash) internal returns (bool) {
    bytes32 nameHash = _releasePackageNameLookup[releaseHash];
    var version = _recordedVersions[_releaseVersionLookup[releaseHash]];
    var latestPatch = _recordedVersions[_releaseVersionLookup[_latestPatch[nameHash][version.major][version.minor]]];

    if (version.isGreaterOrEqual(latestPatch)) {
        _latestPatch[nameHash] = releaseHash;
        return true;
    } else {
        return false;
    }
  }

  function updatePreReleaseTree(bytes32 releaseHash) internal returns (bool) {
    bytes32 nameHash = _releasePackageNameLookup[releaseHash];
    var version = _recordedVersions[_releaseVersionLookup[releaseHash]];
    var latestPreRelease = _recordedVersions[_releaseVersionLookup[_latestPreRelease[nameHash][version.major][version.minor][version.patch]]];

    if (version.isGreaterOrEqual(latestPreRelease)) {
        _latestPreRelease[nameHash] = releaseHash;
        return true;
    } else {
        return false;
    }
  }

  /*
   *  Getter helpers.
   */
  function releaseExists(bytes32 releaseHash) internal returns (bool) {
    return _releaseExists[releaseHash];
  }
}
