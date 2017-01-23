pragma solidity ^0.4.0;

import {PackageDB} from "./PackageDB.sol";
import {ReleaseDB} from "./ReleaseDB.sol";

/// @title Database contract for a package index.
/// @author Piper Merriam <pipermerriam@gmail.com>
contract ReleaseValidator {
  function validateRelease(PackageDB packageDb,
                           ReleaseDB releaseDb,
                           address callerAddress,
                           string name,
                           uint32[3] majorMinorPatch,
                           string preRelease,
                           string build,
                           string releaseLockFileURI) constant returns (bool) {
    if (!validateAuthorization(packageDb, name, callerAddress)) {
      // package exists and msg.sender is not the owner not the package owner.
      return false;
    } else if (!validateIsNewRelease(packageDb, releaseDb, name, majorMinorPatch, preRelease, build)) {
      // this version has already been released.
      return false;
    } else if (!validatePackageName(packageDb, name)) {
      // invalid package name.
      return false;
    } else if (!validateReleaseLockfileURI(releaseLockFileURI)) {
      // disallow empty release lockfile URI
      return false;
    } else if (!validateReleaseVersion(majorMinorPatch)) {
      // disallow version 0.0.0
      return false;
    } else if (!validateIsAnyLatest(packageDb, releaseDb, name, majorMinorPatch, preRelease, build)) {
      // Only allow releasing of versions which are the latest in their
      // respective branch of the release tree.
      return false;
    }
    return true;
  }

  function validateAuthorization(PackageDB packageDb,
                                 string name,
                                 address callerAddress) constant returns (bool) {
    bytes32 nameHash = packageDb.hashName(name);
    if (!packageDb.packageExists(nameHash)) {
      return true;
    }
    var (packageOwner,) = packageDb.getPackageData(nameHash);
    if (packageOwner == callerAddress) {
      return true;
    }
    return false;
  }

  function validateIsNewRelease(PackageDB packageDb,
                                ReleaseDB releaseDb,
                                string name,
                                uint32[3] majorMinorPatch,
                                string preRelease,
                                string build) constant returns (bool) {
    var nameHash = packageDb.hashName(name);
    var versionHash = releaseDb.hashVersion(majorMinorPatch[0], majorMinorPatch[1], majorMinorPatch[2], preRelease, build);
    var releaseHash = releaseDb.hashRelease(nameHash, versionHash);
    return !releaseDb.releaseExists(releaseHash);
  }

  uint constant DIGIT_0 = uint(bytes1('0'));
  uint constant DIGIT_9 = uint(bytes1('9'));
  uint constant LETTER_a = uint(bytes1('a'));
  uint constant LETTER_z = uint(bytes1('z'));
  bytes1 constant DASH = bytes1('-');

  /// @dev Returns boolean whether the provided package name is valid.
  /// @param name Package name
  function validatePackageName(PackageDB packageDb, string name) constant returns (bool) {
    var nameHash = packageDb.hashName(name);

    if (packageDb.packageExists(nameHash)) {
      // existing names are always valid.
      return true;
    }

    if (bytes(name).length < 2 || bytes(name).length > 214) {
      return false;
    }
    for (uint i=0; i < bytes(name).length; i++) {
      if (bytes(name)[i] == DASH && i > 0) {
        continue;
      } else if (i > 0 && uint(bytes(name)[i]) >= DIGIT_0 && uint(bytes(name)[i]) <= DIGIT_9) {
        continue;
      } else if (uint(bytes(name)[i]) >= LETTER_a && uint(bytes(name)[i]) <= LETTER_z) {
        continue;
      } else {
        return false;
      }
    }
    return true;
  }

  /// @dev Returns boolean whether the provided release lockfile URI is valid.
  /// @param releaseLockFileURI The URI for a release lockfile.
  function validateReleaseLockfileURI(string releaseLockFileURI) constant returns (bool) {
    if (bytes(releaseLockFileURI).length ==0) {
      return false;
    }
    return true;
  }

  function validateReleaseVersion(uint32[3] majorMinorPatch) constant returns (bool) {
    if (majorMinorPatch[0] > 0) {
      return true;
    } else if (majorMinorPatch[1] > 0) {
      return true;
    } else if (majorMinorPatch[2] > 0) {
      return true;
    } else {
      return false;
    }
  }

  /// @dev Returns boolean indicating whether the given version hash is the latest version in any branch of the release tree.
  /// @param nameHash The nameHash of the package to check against.
  /// @param versionHash The versionHash of the version to check.
  function validateIsAnyLatest(PackageDB packageDb,
                               ReleaseDB releaseDb,
                               string name,
                               uint32[3] majorMinorPatch,
                               string preRelease,
                               string build) constant returns (bool) {
    var nameHash = packageDb.hashName(name);
    var versionHash = releaseDb.hashVersion(majorMinorPatch[0], majorMinorPatch[1], majorMinorPatch[2], preRelease, build);
    if (releaseDb.isLatestMajorTree(nameHash, versionHash)) {
      return true;
    } else if (hasLatestMinor(releaseDb, nameHash, versionHash) && releaseDb.isLatestMinorTree(nameHash, versionHash)) {
      return true;
    } else if (hasLatestPatch(releaseDb, nameHash, versionHash) && releaseDb.isLatestPatchTree(nameHash, versionHash)) {
      return true;
    } else if (hasLatestPreRelease(releaseDb, nameHash, versionHash) && releaseDb.isLatestPreReleaseTree(nameHash, versionHash)) {
      return true;
    } else {
      return false;
    }
  }

  /// @dev Returns boolean indicating whether there is a latest minor version in the version tree indicated by the provided version has for the package indicated by the provided name hash.
  /// @param nameHash The nameHash of the package to check against.
  /// @param versionHash The versionHash of the version to check.
  function hasLatestMinor(ReleaseDB releaseDb, bytes32 nameHash, bytes32 versionHash) constant returns (bool) {
      var (major,) = releaseDb.getMajorMinorPatch(versionHash);
      return releaseDb.getLatestMinorTree(nameHash, major) != 0x0;
  }

  /// @dev Returns boolean indicating whether there is a latest patch version in the version tree indicated by the provided version has for the package indicated by the provided name hash.
  /// @param nameHash The nameHash of the package to check against.
  /// @param versionHash The versionHash of the version to check.
  function hasLatestPatch(ReleaseDB releaseDb, bytes32 nameHash, bytes32 versionHash) constant returns (bool) {
      var (major, minor,) = releaseDb.getMajorMinorPatch(versionHash);
      return releaseDb.getLatestPatchTree(nameHash, major, minor) != 0x0;
  }

  /// @dev Returns boolean indicating whether there is a latest pre-release version in the version tree indicated by the provided version has for the package indicated by the provided name hash.
  /// @param nameHash The nameHash of the package to check against.
  /// @param versionHash The versionHash of the version to check.
  function hasLatestPreRelease(ReleaseDB releaseDb, bytes32 nameHash, bytes32 versionHash) constant returns (bool) {
      var (major, minor, patch) = releaseDb.getMajorMinorPatch(versionHash);
      return releaseDb.getLatestPreReleaseTree(nameHash, major, minor, patch) != 0x0;
  }
}
