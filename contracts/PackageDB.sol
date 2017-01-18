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
  mapping (bytes32 => string) _packageNames;
  mapping (bytes32 => address) _packageOwners;
  mapping (bytes32 => bytes32[]) _packageReleaseHashes;
  // (releaseHash => value)
  mapping (bytes32 => bytes32) _releaseVersionLookup;
  mapping (bytes32 => bytes32) _releasePackageNameLookup;
  mapping (bytes32 => bool) _releaseExists;
  mapping (bytes32 => string) _releaseLockFiles;
  // (releaseHash => value)
  mapping (bytes32 => SemVersionLib.SemVersion) _recordedVersions;
  mapping (bytes32 => bool) _versionExists;

  event ReleaseCreate(bytes32 indexed releaseHash);
  event ReleaseUpdate(bytes32 indexed releaseHash);
  event ReleaseDelete(bytes32 indexed releaseHash);
  event PackageOwnerUpdate(address indexed oldOwner, address indexed newOwner);

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

  /*
   *  Modifiers
   */
  modifier onlyIfVersionExists(bytes32 versionHash) {
    if (!_versionExists[versionHash]) {
      throw;
    } else {
      _;
    }
  }

  modifier onlyIfReleaseExists(bytes32 releaseHash) {
    if (!_releaseExists[releaseHash]) {
      throw;
    } else {
      _;
    }
  }

  modifier onlyIfPackageExists(string name) {
    if (!_packageExists[hashName(name)]) {
      throw;
    } else {
      _;
    }
  }

  //
  // Public Write API
  //
  function setRelease(string name,
                      uint32 major,
                      uint32 minor,
                      uint32 patch,
                      string preRelease,
                      string build,
                      string releaseLockFileURI) auth public returns (bool) {

    // Hash the name and the version for storing data
    bytes32 nameHash = hashName(name);
    bytes32 releaseHash = hashRelease(name, major, minor, patch, preRelease, build);

    // Mark the package as existing if it isn't already tracked.
    if (!_packageExists[nameHash]) {
      _packageNames[nameHash] = name;
      _packageExists[nameHash] = true;
    }

    // If this is a new version push it onto the array of version hashes for
    // this package.
    if (!_releaseExists[releaseHash]) {
      _packageReleaseHashes[nameHash].push(releaseHash);
      _releasePackageNameLookup[releaseHash] = nameHash;
      _releaseExists[releaseHash] = true;
      ReleaseCreate(releaseHash);
    } else {
      ReleaseUpdate(releaseHash);
    }

    // Save a mapping from releaseHash to versionHash
    _releaseVersionLookup[releaseHash] = setVersion(major, minor, patch, preRelease, build);

    // Save the release lockfile URI
    _releaseLockFiles[releaseHash] = releaseLockFileURI;

    // Track latest released versions for each branch of the release tree.
    updateLatestTree(releaseHash);

    return true;
  }

  function removeRelease(string name, uint idx) auth public returns (bool) {
    uint numReleases = getNumReleases(name);

    if (idx >= numReleases) {
      return false;
    }

    bytes32 nameHash = hashName(name);
    bytes32 releaseHash = _packageReleaseHashes[nameHash][idx];

    delete _releaseExists[releaseHash];
    delete _releaseLockFiles[releaseHash];
    delete _releasePackageNameLookup[releaseHash];
    delete _releaseVersionLookup[releaseHash];

    // Move the last item in the list of version hashes into the slot being
    // removed and then shorten the array length by 1.
    if (idx != numReleases - 1) {
      _packageReleaseHashes[nameHash][idx] = _packageReleaseHashes[nameHash][numReleases];
    }
    _packageReleaseHashes[nameHash].length -= 1;

    ReleaseDelete(releaseHash);

    return true;
  }

  function updateLatestTree(bytes32 releaseHash) auth public returns (bool) {
    updateMajorTree(releaseHash);
    updateMinorTree(releaseHash);
    updatePatchTree(releaseHash);
    updatePreReleaseTree(releaseHash);
    return true;
  }

  function setVersion(uint32 major,
                      uint32 minor,
                      uint32 patch,
                      string preRelease,
                      string build) auth public returns (bytes32) {
    bytes32 versionHash = hashVersion(major, minor, patch, preRelease, build);

    if (!_versionExists[versionHash]) {
      _recordedVersions[versionHash].init(major, minor, patch, preRelease, build);
      _versionExists[versionHash] = true;
    }
    return versionHash;
  }

  function setPackageOwner(string name,
                           address newPackageOwner) auth public returns (bool) {
    bytes32 nameHash = hashName(name);
    PackageOwnerUpdate(_packageOwners[nameHash], newPackageOwner);
    _packageOwners[nameHash] = newPackageOwner;
    return true;
  }

  //
  // Public Read API
  //

  /*
   *  Querying Existence
   */
  function packageExists(string name) constant returns (bool) {
    bytes32 nameHash = hashName(name);
    return _packageExists[nameHash];
  }

  function releaseExists(string name,
                         uint32 major,
                         uint32 minor,
                         uint32 patch,
                         string preRelease,
                         string build) constant returns (bool) {
    bytes32 releaseHash = hashRelease(name, major, minor, patch, preRelease, build);
    return _releaseExists[releaseHash];
  }

  function versionExists(bytes32 versionHash) constant returns (bool) {
    return _versionExists[versionHash];
  }

  /*
   *  Package Getters
   */
  function getPackageOwner(string name) constant returns (address) {
    return _packageOwners[hashName(name)];
  }

  function getNumReleases(string name) constant returns (uint) {
    return _packageReleaseHashes[hashName(name)].length;
  }

  function getPackageReleaseHash(string name, uint idx) constant returns (bytes32) {
    return _packageReleaseHashes[hashName(name)][idx];
  }

  function getLatestVersion(string name) constant returns (bytes32) {
    return _latestMajor[hashName(name)];
  }

  /*
   *  Release Getters
   */
  function getMajorMinorPatch(bytes32 releaseHash) onlyIfReleaseExists(releaseHash) 
                                                   constant 
                                                   returns (uint32, uint32, uint32) {
    var version = _recordedVersions[_releaseVersionLookup[releaseHash]];
    return (version.major, version.minor, version.patch);
  }

  function getPreRelease(bytes32 releaseHash) onlyIfReleaseExists(releaseHash) 
                                              constant 
                                              returns (string) {
    return _recordedVersions[_releaseVersionLookup[releaseHash]].preRelease;
  }

  function getBuild(bytes32 releaseHash) onlyIfReleaseExists(releaseHash) 
                                         constant 
                                         returns (string) {
    return _recordedVersions[_releaseVersionLookup[releaseHash]].build;
  }

  function getPackageName(bytes32 releaseHash) onlyIfReleaseExists(releaseHash) 
                                               constant 
                                               returns (string) {
    return _packageNames[_releasePackageNameLookup[releaseHash]];
  }

  function getReleaseLockileURI(bytes32 releaseHash) onlyIfReleaseExists(releaseHash)
                                               constant 
                                               returns (string) {
    return _releaseLockFiles[releaseHash];
  }

  /*
   *  Hash Functions
   */
  function hashName(string name) constant returns (bytes32) {
    return sha3(name);
  }

  function hashVersion(uint32 major,
                       uint32 minor,
                       uint32 patch,
                       string preRelease,
                       string build) constant returns (bytes32) {
    return sha3(major, minor, patch, preRelease, build);
  }

  function hashRelease(string name,
                       uint32 major,
                       uint32 minor,
                       uint32 patch,
                       string preRelease,
                       string build) constant returns (bytes32) {
    return sha3(name, major, minor, patch, preRelease, build);
  }

  /*
   *  Latest version querying API
   */
  function isAnyLatest(bytes32 nameHash,
                       bytes32 versionHash) onlyIfVersionExists(versionHash)
                                            constant
                                            returns (bool) {
    if (isLatestMajorTree(nameHash, versionHash)) {
      return true;
    } else if (isLatestMinorTree(nameHash, versionHash)) {
      return true;
    } else if (isLatestPatchTree(nameHash, versionHash)) {
      return true;
    } else if (isLatestPreReleaseTree(nameHash, versionHash)) {
      return true;
    } else {
      return false;
    }
  }

  function getLatestMajorTree(bytes32 nameHash) constant returns (bytes32) {
    return _latestMajor[nameHash];
  }

  function getLatestMinorTree(bytes32 nameHash, uint32 major) constant returns (bytes32) {
    return _latestMinor[nameHash][major];
  }

  function getLatestPatchTree(bytes32 nameHash,
                              uint32 major,
                              uint32 minor) constant returns (bytes32) {
    return _latestPatch[nameHash][major][minor];
  }

  function getLatestPreReleaseTree(bytes32 nameHash,
                                   uint32 major,
                                   uint32 minor,
                                   uint32 patch) constant returns (bytes32) {
    return _latestPreRelease[nameHash][major][minor][patch];
  }

  function isLatestMajorTree(bytes32 nameHash,
                             bytes32 versionHash) onlyIfVersionExists(versionHash) 
                                                  constant 
                                                  returns (bool) {
    var version = _recordedVersions[versionHash];
    var latestMajor = _recordedVersions[_latestMajor[nameHash]];
    return version.isGreaterOrEqual(latestMajor);
  }

  function isLatestMinorTree(bytes32 nameHash,
                             bytes32 versionHash) onlyIfVersionExists(versionHash) 
                                                  constant 
                                                  returns (bool) {
    var version = _recordedVersions[versionHash];
    var latestMinor = _recordedVersions[_latestMinor[nameHash][version.major]];
    return version.isGreaterOrEqual(latestMinor);
  }

  function isLatestPatchTree(bytes32 nameHash,
                             bytes32 versionHash) onlyIfVersionExists(versionHash) 
                                                  constant 
                                                  returns (bool) {
    var version = _recordedVersions[versionHash];
    var latestPatch = _recordedVersions[_latestPatch[nameHash][version.major][version.minor]];
    return version.isGreaterOrEqual(latestPatch);
  }

  function isLatestPreReleaseTree(bytes32 nameHash,
                                  bytes32 versionHash) onlyIfVersionExists(versionHash) 
                                                       constant 
                                                       returns (bool) {
    var version = _recordedVersions[versionHash];
    var latestPreRelease = _recordedVersions[_latestPreRelease[nameHash][version.major][version.minor][version.patch]];
    return version.isGreaterOrEqual(latestPreRelease);
  }

  //
  // +--------------+
  // | Internal API |
  // +--------------+
  //

  /*
   *  Tracking of latest releases for each branch of the release tree.
   */

  function updateMajorTree(bytes32 releaseHash) onlyIfReleaseExists(releaseHash) 
                                                internal 
                                                returns (bool) {
    bytes32 nameHash = _releasePackageNameLookup[releaseHash];
    bytes32 versionHash = _releaseVersionLookup[releaseHash];

    if (isLatestMajorTree(nameHash, versionHash)) {
      _latestMajor[nameHash] = releaseHash;
      return true;
    } else {
      return false;
    }
  }

  function updateMinorTree(bytes32 releaseHash) internal returns (bool) {
    bytes32 nameHash = _releasePackageNameLookup[releaseHash];
    bytes32 versionHash = _releaseVersionLookup[releaseHash];

    if (isLatestMinorTree(nameHash, versionHash)) {
      var version = _recordedVersions[versionHash];
      _latestMinor[nameHash][version.major] = releaseHash;
      return true;
    } else {
      return false;
    }
  }

  function updatePatchTree(bytes32 releaseHash) internal returns (bool) {
    bytes32 nameHash = _releasePackageNameLookup[releaseHash];
    bytes32 versionHash = _releaseVersionLookup[releaseHash];

    if (isLatestPatchTree(nameHash, versionHash)) {
      var version = _recordedVersions[versionHash];
      _latestPatch[nameHash][version.major][version.minor] = releaseHash;
      return true;
    } else {
      return false;
    }
  }

  function updatePreReleaseTree(bytes32 releaseHash) internal returns (bool) {
    bytes32 nameHash = _releasePackageNameLookup[releaseHash];
    bytes32 versionHash = _releaseVersionLookup[releaseHash];

    if (isLatestPreReleaseTree(nameHash, versionHash)) {
      var version = _recordedVersions[versionHash];
      _latestPreRelease[nameHash][version.major][version.minor][version.patch] = releaseHash;
      return true;
    } else {
      return false;
    }
  }
}
