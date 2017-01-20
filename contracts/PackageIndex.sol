pragma solidity ^0.4.0;


import {PackageDB} from "./PackageDB.sol";
import {Authorized} from "./Authority.sol";


/// @title Database contract for a package index.
/// @author Tim Coulter <tim.coulter@consensys.net>, Piper Merriam <pipermerriam@gmail.com>
contract PackageIndex is Authorized {
  PackageDB public packageDb;

  function PackageIndex(address _packageDb) {
    if (_packageDb == 0x0) throw;
    packageDb = PackageDB(_packageDb);
  }


  //
  // Public Write API
  //
  /// @dev Creates a a new release for the named package.  If this is the first release for the given package then this will also assign msg.sender as the owner of the package.  Returns success.
  /// @notice Will create a new release the given package with the given release information.
  /// @param name Package name
  /// @param major The major portion of the semver version string.
  /// @param minor The minor portion of the semver version string.
  /// @param patch The patch portion of the semver version string.
  /// @param preRelease The pre-release portion of the semver version string.  Use empty string if the version string has no pre-release portion.
  /// @param build The build portion of the semver version string.  Use empty string if the version string has no build portion.
  /// @param releaseLockFileURI The URI for the release lockfile for this release.
  function release(string name,
                   uint32 major,
                   uint32 minor,
                   uint32 patch,
                   string preRelease,
                   string build,
                   string releaseLockFileURI) public auth returns (bool) {
    if (packageExists(name) && getPackageOwner(name) != msg.sender) {
      // not the package owner.
      return false;
    } else if (versionExists(name, major, minor, patch, preRelease, build)) {
      // this version has already been released.
      return false;
    } else if (!packageDb.packageExists(name) && !validatePackageName(name)) {
      // invalid package name.
      return false;
    } else if (!validateReleaseLockfileURI(releaseLockFileURI)) {
      // disallow empty release lockfile URI
      return false;
    } else if (major == 0 && minor == 0 && patch == 0) {
      // disallow version 0.0.0
      return false;
    }

    bytes32 nameHash = packageDb.hashName(name);
    bytes32 versionHash = packageDb.hashVersion(major, minor, patch, preRelease, build);

    if (!packageDb.versionExists(versionHash)) {
      packageDb.setVersion(major, minor, patch, preRelease, build);
    }

    // If this is the highest release in any of the three buckets, allow it.
    if (isAnyLatest(nameHash, versionHash)) {
      if (!packageExists(name)) {
        packageDb.setPackageOwner(name, msg.sender);
      }

      packageDb.setRelease(name, major, minor, patch, preRelease, build, releaseLockFileURI);

      return true;
    } else {
      return false;
    }
  }

  /// @dev Transfers package ownership to the provider new owner address.
  /// @notice Will transfer ownership of this package to the provided new owner address.
  /// @param name Package name
  /// @param newPackageOwner The address of the new owner.
  function transferPackageOwner(string name,
                                address newPackageOwner) public auth returns (bool) {
    if (getPackageOwner(name) != msg.sender) {
      return false;
    }
    return packageDb.setPackageOwner(name, newPackageOwner);
  }

  //
  // Public Read API
  //

  /*
   *  Package Getters
   */
  /// @dev Query the existence of a package with the given name.  Returns boolean indicating whether the package exists.
  /// @param name Package name
  function packageExists(string name) constant returns (bool) {
    return packageDb.packageExists(name);
  }

  /// @dev Query the existence of a release at the provided version for the named package.  Returns boolean indicating whether such a release exists.
  /// @param name Package name
  /// @param major The major portion of the semver version string.
  /// @param minor The minor portion of the semver version string.
  /// @param patch The patch portion of the semver version string.
  /// @param preRelease The pre-release portion of the semver version string.  Use empty string if the version string has no pre-release portion.
  /// @param build The build portion of the semver version string.  Use empty string if the version string has no build portion.
  function versionExists(string name,
                         uint32 major,
                         uint32 minor,
                         uint32 patch,
                         string preRelease,
                         string build) returns (bool) {
    return packageDb.releaseExists(name, major, minor, patch, preRelease, build);
  }

  /// @dev Returns the address of the owner for the named package.
  /// @param name Package name
  function getPackageOwner(string name) constant returns (address) {
    return packageDb.getPackageOwner(name);
  }

  /// @dev Returns the number of releases for the named package.
  /// @param name Package name
  function getNumReleases(string name) constant returns (uint) {
    return packageDb.getNumReleases(name);
  }

  /*
   *  Release Getters
   */
  /// @dev Returns the release data for the release associated with the given release hash.
  /// @param releaseHash The release hash.
  function getRelease(bytes32 releaseHash) constant returns (uint32 major,
                                                             uint32 minor,
                                                             uint32 patch,
                                                             string preRelease,
                                                             string build,
                                                             string releaseLockFileURI) {
    (major, minor, patch) = packageDb.getMajorMinorPatch(packageDb.getReleaseVersionHash(releaseHash));
    preRelease = getPreRelease(releaseHash);
    build = getBuild(releaseHash);
    releaseLockFileURI = getReleaseLockileURI(releaseHash);
    return (major, minor, patch, preRelease, build, releaseLockFileURI);
  }

  /// @dev Returns the release data for the release at the provide index in the array of package releases.
  /// @param name Package name
  /// @param releaseIdx The index of the release to retrieve.
  function getRelease(string name, uint releaseIdx) constant returns (uint32 major,
                                                                      uint32 minor,
                                                                      uint32 patch,
                                                                      string preRelease,
                                                                      string build,
                                                                      string releaseLockFileURI) {
    bytes32 releaseHash = packageDb.getPackageReleaseHash(name, releaseIdx);
    return getRelease(releaseHash);
  }


  /// @dev Returns the release data for the latest release for the given package name.
  /// @param name Package name
  function getLatestVersion(string name) constant returns (uint32 major,
                                                           uint32 minor,
                                                           uint32 patch,
                                                           string preRelease,
                                                           string build,
                                                           string releaseLockFileURI) {
    bytes32 latestReleaseHash = packageDb.getLatestMajorTree(packageDb.hashName(name));
    return getRelease(latestReleaseHash);
  }

  /// @dev Returns an array of all release hashes for the named package.
  /// @param name Package name
  function getAllReleaseHashes(string name) constant returns (bytes32[]) {
    uint numReleases = getNumReleases(name);
    bytes32[] memory releaseHashes = new bytes32[](numReleases);

    for (uint i = 0; i < numReleases; i++) {
      releaseHashes[i] = packageDb.getPackageReleaseHash(name, i);
    }

    return releaseHashes;
  }

  /*
   *  Validation API
   */
  uint constant DIGIT_0 = uint(bytes1('0'));
  uint constant DIGIT_9 = uint(bytes1('9'));
  uint constant LETTER_a = uint(bytes1('a'));
  uint constant LETTER_z = uint(bytes1('z'));
  bytes1 constant DASH = bytes1('-');

  /// @dev Returns boolean whether the provided package name is valid.
  /// @param name Package name
  function validatePackageName(string name) constant returns (bool) {
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

  //
  // Private Internal API
  //

  /// @dev Returns boolean indicating whether the given version hash is the latest version in any branch of the release tree.
  /// @param nameHash The nameHash of the package to check against.
  /// @param versionHash The versionHash of the version to check.
  function isAnyLatest(bytes32 nameHash,
                       bytes32 versionHash) internal
                                            returns (bool) {
    if (packageDb.isLatestMajorTree(nameHash, versionHash)) {
      return true;
    } else if (hasLatestMinor(nameHash, versionHash) && packageDb.isLatestMinorTree(nameHash, versionHash)) {
      return true;
    } else if (hasLatestPatch(nameHash, versionHash) && packageDb.isLatestPatchTree(nameHash, versionHash)) {
      return true;
    } else if (hasLatestPreRelease(nameHash, versionHash) && packageDb.isLatestPreReleaseTree(nameHash, versionHash)) {
      return true;
    } else {
      return false;
    }
  }

  /// @dev Returns boolean indicating whether there is a latest minor version in the version tree indicated by the provided version has for the package indicated by the provided name hash.
  /// @param nameHash The nameHash of the package to check against.
  /// @param versionHash The versionHash of the version to check.
  function hasLatestMinor(bytes32 nameHash, bytes32 versionHash) internal returns (bool) {
      var (major,) = packageDb.getMajorMinorPatch(versionHash);
      return packageDb.getLatestMinorTree(nameHash, major) != 0x0;
  }

  /// @dev Returns boolean indicating whether there is a latest patch version in the version tree indicated by the provided version has for the package indicated by the provided name hash.
  /// @param nameHash The nameHash of the package to check against.
  /// @param versionHash The versionHash of the version to check.
  function hasLatestPatch(bytes32 nameHash, bytes32 versionHash) internal returns (bool) {
      var (major, minor,) = packageDb.getMajorMinorPatch(versionHash);
      return packageDb.getLatestPatchTree(nameHash, major, minor) != 0x0;
  }

  /// @dev Returns boolean indicating whether there is a latest pre-release version in the version tree indicated by the provided version has for the package indicated by the provided name hash.
  /// @param nameHash The nameHash of the package to check against.
  /// @param versionHash The versionHash of the version to check.
  function hasLatestPreRelease(bytes32 nameHash, bytes32 versionHash) internal returns (bool) {
      var (major, minor, patch) = packageDb.getMajorMinorPatch(versionHash);
      return packageDb.getLatestPreReleaseTree(nameHash, major, minor, patch) != 0x0;
  }

  bytes4 constant GET_RELEASE_LOCKFILE_URI_SIG = bytes4(sha3("getReleaseLockileURI(bytes32)"));

  /// @dev Retrieves the release lockfile URI from the package db.
  /// @param releaseHash The release hash to retrieve the URI from.
  function getReleaseLockileURI(bytes32 releaseHash) internal returns (string) {
    return fetchString(GET_RELEASE_LOCKFILE_URI_SIG, releaseHash);
  }

  bytes4 constant GET_PRE_RELEASE_SIG = bytes4(sha3("getPreRelease(bytes32)"));

  /// @dev Retrieves the pre-release string from the package db.
  /// @param releaseHash The release hash to retrieve the string from.
  function getPreRelease(bytes32 releaseHash) internal returns (string) {
    return fetchString(GET_PRE_RELEASE_SIG, releaseHash);
  }

  bytes4 constant GET_BUILD_SIG = bytes4(sha3("getBuild(bytes32)"));

  /// @dev Retrieves the build string from the package db.
  /// @param releaseHash The release hash to retrieve the string from.
  function getBuild(bytes32 releaseHash) internal returns (string) {
    return fetchString(GET_BUILD_SIG, releaseHash);
  }

  /// @dev Retrieves a string from a function on the package db indicated by the provide function selector
  /// @param sig The 4-byte function selector to retrieve the signature from.
  /// @param arg The bytes32 argument that should be passed into the function.
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
