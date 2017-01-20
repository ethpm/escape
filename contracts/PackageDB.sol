pragma solidity ^0.4.0;

import {SemVersionLib} from "./SemVersionLib.sol";
import {Authorized} from "./Authority.sol";


/// @title Database contract for a package index.
/// @author Tim Coulter <TODO@TODO.TODO, Piper Merriam <pipermerriam@gmail.com>
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
  // (versionHash => value)
  mapping (bytes32 => SemVersionLib.SemVersion) _recordedVersions;
  mapping (bytes32 => bool) _versionExists;

  event ReleaseCreate(bytes32 indexed releaseHash);
  event ReleaseUpdate(bytes32 indexed releaseHash);
  event ReleaseDelete(bytes32 indexed releaseHash);
  event PackageCreate(bytes32 indexed nameHash);
  event PackageDelete(bytes32 indexed nameHash);
  event PackageOwnerUpdate(address indexed oldOwner, address indexed newOwner);

  /*
   * Latest released version tracking for each branch of the release tree.
   */

  // (nameHash => releaseHash);
  mapping (bytes32 => bytes32) _latestMajor;

  // (nameHash => major => releaseHash);
  mapping (bytes32 => mapping(uint32 => bytes32)) _latestMinor;

  // (nameHash => major => minor => releaseHash);
  mapping (bytes32 => mapping (uint32 => mapping(uint32 => bytes32))) _latestPatch;

  // (nameHash => major => minor => patch => releaseHash);
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
  /// @dev Creates or updates a release for the named package.  Returns success.
  /// @param name Package name
  /// @param major The major portion of the semver version string.
  /// @param minor The minor portion of the semver version string.
  /// @param patch The patch portion of the semver version string.
  /// @param preRelease The pre-release portion of the semver version string.  Use empty string if the version string has no pre-release portion.
  /// @param build The build portion of the semver version string.  Use empty string if the version string has no build portion.
  /// @param releaseLockFileURI The URI for the release lockfile for this release.
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
      PackageCreate(nameHash);
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

  /// @dev Removes a release from the named package.  Returns success.
  /// @param name Package name
  /// @param idx The index of the release hash in the array of package release hashes which should be removed.
  function removeRelease(string name, uint idx) auth public returns (bool) {
    uint numReleases = getNumReleases(name);

    if (idx >= numReleases) {
      return false;
    }

    bytes32 nameHash = hashName(name);
    bytes32 releaseHash = _packageReleaseHashes[nameHash][idx];
    var version = _releaseVersionLookup[releaseHash];

    // In any branch of the release tree in which this version is the latest we
    // remove it.  This will leave the release tree for this package in an
    // invalid state.  The `updateLatestTree` function` provides a path to
    // recover from this state.  The naive approach would be to call it on all
    // release hashes in the array of remaining package release hashes which
    // will properly repopulate the release tree for this package.
    if (_latestMajor[nameHash] == releaseHash) {
      delete _latestMajor[nameHash];
    }
    if (_latestMinor[nameHash][version.major] == releaseHash) {
      delete _latestMinor[nameHash][version.major];
    }
    if (_latestPatch[nameHash][version.major][version.minor] == releaseHash) {
      delete _latestPatch[nameHash][version.major][version.minor];
    }
    if (_latestPreRelease[nameHash][version.major][version.minor][version.patch] == releaseHash) {
      delete _latestPreRelease[nameHash][version.major][version.minor][version.patch];
    }

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

  /// @dev Updates each branch of the tree, replacing the current leaf node with this release hash if this release hash should be the new leaf.  Returns success.
  /// @param releaseHash The releaseHash to check.
  function updateLatestTree(bytes32 releaseHash) auth public returns (bool) {
    // TODO: can we remove the `auth` protection from this method.  I don't
    // believe there is any attack vector in allowing it to be called
    // anonymously.
    updateMajorTree(releaseHash);
    updateMinorTree(releaseHash);
    updatePatchTree(releaseHash);
    updatePreReleaseTree(releaseHash);
    return true;
  }

  /// @dev Adds the given version to the local version database.  Returns the versionHash for the provided version.
  /// @param major The major portion of the semver version string.
  /// @param minor The minor portion of the semver version string.
  /// @param patch The patch portion of the semver version string.
  /// @param preRelease The pre-release portion of the semver version string.  Use empty string if the version string has no pre-release portion.
  /// @param build The build portion of the semver version string.  Use empty string if the version string has no build portion.
  function setVersion(uint32 major,
                      uint32 minor,
                      uint32 patch,
                      string preRelease,
                      string build) auth public returns (bytes32) {
    // TODO: can we remove the `auth` protection from this function.  It should
    // be safe to allow this to be called publicly by
    // anyone.
    bytes32 versionHash = hashVersion(major, minor, patch, preRelease, build);

    if (!_versionExists[versionHash]) {
      _recordedVersions[versionHash].init(major, minor, patch, preRelease, build);
      _versionExists[versionHash] = true;
    }
    return versionHash;
  }

  /// @dev Sets the owner of the named package to the provided address.  Returns success.
  /// @param newPackageOwner The address of the new owner.
  function setPackageOwner(string name,
                           address newPackageOwner) auth public returns (bool) {
    bytes32 nameHash = hashName(name);
    PackageOwnerUpdate(_packageOwners[nameHash], newPackageOwner);
    _packageOwners[nameHash] = newPackageOwner;
    return true;
  }

  /// @dev Removes the named package from the package db.  Packages with existing releases may not be removed.  Returns success.
  /// @param newPackageOwner The address of the new owner.
  function removePackage(string name) auth public returns (bool) {
    bytes32 nameHash = hashName(name);

    if (_packageReleaseHashes[nameHash].length > 0) {
      // Must first remove all releases prior to removing the package.
      return false;
    }

    delete _packageNames[nameHash];
    delete _packageReleaseHashes[nameHash];
    delete _packageExists[nameHash];
    delete _packageOwners[nameHash];

    PackageDelete(nameHash);

    return true;
  }

  //
  // Public Read API
  //

  /*
   *  Querying Existence
   */
  /// @dev Query the existence of a package with the given name.  Returns boolean indicating whether the package exists.
  /// @param name Package name
  function packageExists(string name) constant returns (bool) {
    bytes32 nameHash = hashName(name);
    return _packageExists[nameHash];
  }

  /// @dev Query the existence of a release at the provided version for the named package.  Returns boolean indicating whether such a release exists.
  /// @param name Package name
  /// @param major The major portion of the semver version string.
  /// @param minor The minor portion of the semver version string.
  /// @param patch The patch portion of the semver version string.
  /// @param preRelease The pre-release portion of the semver version string.  Use empty string if the version string has no pre-release portion.
  /// @param build The build portion of the semver version string.  Use empty string if the version string has no build portion.
  function releaseExists(string name,
                         uint32 major,
                         uint32 minor,
                         uint32 patch,
                         string preRelease,
                         string build) constant returns (bool) {
    bytes32 releaseHash = hashRelease(name, major, minor, patch, preRelease, build);
    return _releaseExists[releaseHash];
  }

  /// @dev Query the existence of the provided version in the recorded versions.  Returns boolean indicating whether such a version exists.
  /// @param major The major portion of the semver version string.
  /// @param minor The minor portion of the semver version string.
  /// @param patch The patch portion of the semver version string.
  /// @param preRelease The pre-release portion of the semver version string.  Use empty string if the version string has no pre-release portion.
  /// @param build The build portion of the semver version string.  Use empty string if the version string has no build portion.
  function versionExists(bytes32 versionHash) constant returns (bool) {
    return _versionExists[versionHash];
  }

  /*
   *  Package Getters
   */
  /// @dev Returns the address of the owner for the named package.
  /// @param name Package name
  function getPackageOwner(string name) constant returns (address) {
    return _packageOwners[hashName(name)];
  }

  /// @dev Returns the number of releases for the named package.
  /// @param name Package name
  function getNumReleases(string name) constant returns (uint) {
    return _packageReleaseHashes[hashName(name)].length;
  }

  /// @dev Returns the releaseHash at the given index for the named package.
  /// @param name Package name
  /// @param idx Index of the desired release in the array of release hashes.
  function getPackageReleaseHash(string name, uint idx) constant returns (bytes32) {
    return _packageReleaseHashes[hashName(name)][idx];
  }

  /*
   *  Release Getters
   */
  /// @dev Returns a 3-tuple of the major, minor, and patch components from the version of the given release hash.
  /// @param releaseHash Release hash
  function getMajorMinorPatch(bytes32 releaseHash) onlyIfReleaseExists(releaseHash) 
                                                   constant 
                                                   returns (uint32, uint32, uint32) {
    var version = _recordedVersions[_releaseVersionLookup[releaseHash]];
    return (version.major, version.minor, version.patch);
  }

  /// @dev Returns the pre-release string from the version of the given release hash.
  /// @param releaseHash Release hash
  function getPreRelease(bytes32 releaseHash) onlyIfReleaseExists(releaseHash) 
                                              constant 
                                              returns (string) {
    return _recordedVersions[_releaseVersionLookup[releaseHash]].preRelease;
  }

  /// @dev Returns the build string from the version of the given release hash.
  /// @param releaseHash Release hash
  function getBuild(bytes32 releaseHash) onlyIfReleaseExists(releaseHash) 
                                         constant 
                                         returns (string) {
    return _recordedVersions[_releaseVersionLookup[releaseHash]].build;
  }

  /// @dev Returns the name of the package that the given release hash is for.
  /// @param releaseHash Release hash
  function getPackageName(bytes32 releaseHash) onlyIfReleaseExists(releaseHash) 
                                               constant 
                                               returns (string) {
    return _packageNames[_releasePackageNameLookup[releaseHash]];
  }

  /// @dev Returns the URI of the release lockfile for the given release hash.
  /// @param releaseHash Release hash
  function getReleaseLockileURI(bytes32 releaseHash) onlyIfReleaseExists(releaseHash)
                                               constant 
                                               returns (string) {
    return _releaseLockFiles[releaseHash];
  }

  /*
   *  Hash Functions
   */
  /// @dev Returns name hash for a given package name.
  /// @param name Package name
  function hashName(string name) constant returns (bytes32) {
    return sha3(name);
  }

  /// @dev Returns version hash for the given semver version.
  /// @param name Package name
  /// @param major The major portion of the semver version string.
  /// @param minor The minor portion of the semver version string.
  /// @param patch The patch portion of the semver version string.
  /// @param preRelease The pre-release portion of the semver version string.  Use empty string if the version string has no pre-release portion.
  /// @param build The build portion of the semver version string.  Use empty string if the version string has no build portion.
  function hashVersion(uint32 major,
                       uint32 minor,
                       uint32 patch,
                       string preRelease,
                       string build) constant returns (bytes32) {
    return sha3(major, minor, patch, preRelease, build);
  }

  /// @dev Returns release hash for the given release
  /// @param name Package name
  /// @param major The major portion of the semver version string.
  /// @param minor The minor portion of the semver version string.
  /// @param patch The patch portion of the semver version string.
  /// @param preRelease The pre-release portion of the semver version string.  Use empty string if the version string has no pre-release portion.
  /// @param build The build portion of the semver version string.  Use empty string if the version string has no build portion.
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

  /// @dev Returns boolean indicating whethe the given version hash is the latest version in any branch of the release tree.
  /// @param nameHash The nameHash of the package to check against.
  /// @param versionHash The versionHash of the version to check.
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

  /// @dev Returns the release hash of the latest release in the major branch of the package release tree.
  /// @param nameHash The nameHash of the package
  function getLatestMajorTree(bytes32 nameHash) constant returns (bytes32) {
    return _latestMajor[nameHash];
  }

  /// @dev Returns the release hash of the latest release in the minor branch of the package release tree.
  /// @param nameHash The nameHash of the package
  /// @param major The branch of the major portion of the release tree to check.
  function getLatestMinorTree(bytes32 nameHash, uint32 major) constant returns (bytes32) {
    return _latestMinor[nameHash][major];
  }

  /// @dev Returns the release hash of the latest release in the patch branch of the package release tree.
  /// @param nameHash The nameHash of the package
  /// @param major The branch of the major portion of the release tree to check.
  /// @param minor The branch of the minor portion of the release tree to check.
  function getLatestPatchTree(bytes32 nameHash,
                              uint32 major,
                              uint32 minor) constant returns (bytes32) {
    return _latestPatch[nameHash][major][minor];
  }

  /// @dev Returns the release hash of the latest release in the pre-release branch of the package release tree.
  /// @param nameHash The nameHash of the package
  /// @param major The branch of the major portion of the release tree to check.
  /// @param minor The branch of the minor portion of the release tree to check.
  /// @param patch The branch of the patch portion of the release tree to check.
  function getLatestPreReleaseTree(bytes32 nameHash,
                                   uint32 major,
                                   uint32 minor,
                                   uint32 patch) constant returns (bytes32) {
    return _latestPreRelease[nameHash][major][minor][patch];
  }

  /// @dev Returns boolean indicating whethe the given version hash is the latest version in the major branch of the release tree.
  /// @param nameHash The nameHash of the package to check against.
  /// @param versionHash The versionHash of the version to check.
  function isLatestMajorTree(bytes32 nameHash,
                             bytes32 versionHash) onlyIfVersionExists(versionHash) 
                                                  constant 
                                                  returns (bool) {
    var version = _recordedVersions[versionHash];
    var latestMajor = _recordedVersions[_releaseVersionLookup[_latestMajor[nameHash]]];
    return version.isGreaterOrEqual(latestMajor);
  }

  /// @dev Returns boolean indicating whethe the given version hash is the latest version in the minor branch of the release tree.
  /// @param nameHash The nameHash of the package to check against.
  /// @param versionHash The versionHash of the version to check.
  function isLatestMinorTree(bytes32 nameHash,
                             bytes32 versionHash) onlyIfVersionExists(versionHash) 
                                                  constant 
                                                  returns (bool) {
    var version = _recordedVersions[versionHash];
    var latestMinor = _recordedVersions[_releaseVersionLookup[_latestMinor[nameHash][version.major]]];
    return version.isGreaterOrEqual(latestMinor);
  }

  /// @dev Returns boolean indicating whethe the given version hash is the latest version in the patch branch of the release tree.
  /// @param nameHash The nameHash of the package to check against.
  /// @param versionHash The versionHash of the version to check.
  function isLatestPatchTree(bytes32 nameHash,
                             bytes32 versionHash) onlyIfVersionExists(versionHash) 
                                                  constant 
                                                  returns (bool) {
    var version = _recordedVersions[versionHash];
    var latestPatch = _recordedVersions[_releaseVersionLookup[_latestPatch[nameHash][version.major][version.minor]]];
    return version.isGreaterOrEqual(latestPatch);
  }

  /// @dev Returns boolean indicating whethe the given version hash is the latest version in the pre-release branch of the release tree.
  /// @param nameHash The nameHash of the package to check against.
  /// @param versionHash The versionHash of the version to check.
  function isLatestPreReleaseTree(bytes32 nameHash,
                                  bytes32 versionHash) onlyIfVersionExists(versionHash) 
                                                       constant 
                                                       returns (bool) {
    var version = _recordedVersions[versionHash];
    var latestPreRelease = _recordedVersions[_releaseVersionLookup[_latestPreRelease[nameHash][version.major][version.minor][version.patch]]];
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

  /// @dev Sets the given release as the new leaf of the major branch of the release tree if it is greater or equal to the current leaf.
  /// @param releaseHash The release hash of the release to check.
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

  /// @dev Sets the given release as the new leaf of the minor branch of the release tree if it is greater or equal to the current leaf.
  /// @param releaseHash The release hash of the release to check.
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

  /// @dev Sets the given release as the new leaf of the patch branch of the release tree if it is greater or equal to the current leaf.
  /// @param releaseHash The release hash of the release to check.
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

  /// @dev Sets the given release as the new leaf of the pre-release branch of the release tree if it is greater or equal to the current leaf.
  /// @param releaseHash The release hash of the release to check.
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
