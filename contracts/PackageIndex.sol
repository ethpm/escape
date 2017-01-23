pragma solidity ^0.4.0;


import {PackageDB} from "./PackageDB.sol";
import {ReleaseDB} from "./ReleaseDB.sol";
import {ReleaseValidator} from "./ReleaseValidator.sol";
import {Authorized} from "./Authority.sol";


/// @title Database contract for a package index.
/// @author Tim Coulter <tim.coulter@consensys.net>, Piper Merriam <pipermerriam@gmail.com>
contract PackageIndex is Authorized {
  PackageDB public packageDb;
  ReleaseDB public releaseDb;
  ReleaseValidator public releaseValidator;

  //
  // Events
  //
  event PackageDbUpdate(address indexed oldPackageDb, address indexed newPackageDb);
  event ReleaseDbUpdate(address indexed oldReleaseDb, address indexed newReleaseDb);
  event ReleaseValidatorUpdate(address indexed oldReleaseValidator,
                               address indexed newReleaseValidator);

  event PackageRelease(bytes32 indexed nameHash, bytes32 indexed releaseHash);
  event PackageTransfer(address indexed oldOwner, address indexed newOwner);

  //
  // Administrative API
  //
  /// @dev Sets the address of the PackageDb contract.
  /// @param newPackageDb The address to set for the PackageDb.
  function setPackageDb(address newPackageDb) public auth returns (bool) {
    PackageDbUpdate(address(packageDb), newPackageDb);
    packageDb = PackageDB(newPackageDb);
    return true;
  }

  /// @dev Sets the address of the ReleaseDb contract.
  /// @param newReleaseDb The address to set for the ReleaseDb.
  function setReleaseDb(address newReleaseDb) public auth returns (bool) {
    ReleaseDbUpdate(address(releaseDb), newReleaseDb);
    releaseDb = ReleaseDB(newReleaseDb);
    return true;
  }

  /// @dev Sets the address of the ReleaseValidator contract.
  /// @param newReleaseValidator The address to set for the ReleaseValidator.
  function setReleaseValidator(address newReleaseValidator) public auth returns (bool) {
    ReleaseValidatorUpdate(address(releaseValidator), newReleaseValidator);
    releaseValidator = ReleaseValidator(newReleaseValidator);
    return true;
  }

  //
  // +-------------+
  // |  Write API  |
  // +-------------+
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
    if (!releaseValidator.validateRelease(packageDb, releaseDb, msg.sender, name, [major, minor, patch], preRelease, build, releaseLockFileURI)) {
      // not the package owner.
      return false;
    }

    // Compute hashes
    bytes32 nameHash = packageDb.hashName(name);
    bytes32 versionHash = releaseDb.hashVersion(major, minor, patch, preRelease, build);
    bytes32 releaseHash = releaseDb.hashRelease(nameHash, versionHash);

    // If the version for this release is not in the version database, populate it.
    if (!releaseDb.versionExists(versionHash)) {
      releaseDb.setVersion(major, minor, patch, preRelease, build);
    }

    // If the package does not yet exist create it and set the owner
    if (!packageDb.packageExists(nameHash)) {
      packageDb.setPackage(name);
      packageDb.setPackageOwner(nameHash, msg.sender);
    }

    // Create the release and add it to the list of package release hashes.
    releaseDb.setRelease(nameHash, versionHash, releaseLockFileURI);

    // Log the release.
    PackageRelease(nameHash, releaseHash);

    return true;
  }

  /// @dev Transfers package ownership to the provider new owner address.
  /// @notice Will transfer ownership of this package to the provided new owner address.
  /// @param name Package name
  /// @param newPackageOwner The address of the new owner.
  function transferPackageOwner(string name,
                                address newPackageOwner) public auth returns (bool) {
    if (isPackageOwner(name, msg.sender)) {
      // Only the package owner may transfer package ownership.
      return false;
    }

    // Lookup the current owne
    var (packageOwner,) = getPackageData(name);

    // Log the transfer
    PackageTransfer(packageOwner, newPackageOwner);

    // Update the owner.
    packageDb.setPackageOwner(packageDb.hashName(name), newPackageOwner);

    return true;
  }

  //
  // +------------+
  // |  Read API  |
  // +------------+
  //

  /// @dev Query the existence of a package with the given name.  Returns boolean indicating whether the package exists.
  /// @param name Package name
  function packageExists(string name) constant returns (bool) {
    var nameHash = packageDb.hashName(name);
    return packageDb.packageExists(nameHash);
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
                         string build) returns (bool) {
    var nameHash = packageDb.hashName(name);
    var versionHash = releaseDb.hashVersion(major, minor, patch, preRelease, build);
    var releaseHash = releaseDb.hashRelease(nameHash, versionHash);
    return releaseDb.releaseExists(releaseHash);
  }

  /// @dev Returns the number of packages in the index
  function getNumPackages() constant returns (uint) {
    return packageDb.getNumPackages();
  }

  /// @dev Returns the name of the package at the provided index
  /// @param idx The index of the name hash to lookup.
  function getPackageName(uint idx) constant returns (string) {
    var nameHash = packageDb.getPackageNameHash(idx);
    return getPackageName(nameHash);
  }

  /// @dev Returns the package data.
  /// @param name Package name
  function getPackageData(string name) constant
                                       returns (address packageOwner,
                                                uint createdAt,
                                                uint numReleases,
                                                uint updatedAt) {
    var nameHash = packageDb.hashName(name);
    (packageOwner, createdAt, updatedAt) = packageDb.getPackageData(nameHash);
    numReleases = releaseDb.getNumReleasesForNameHash(nameHash);
    return (packageOwner, createdAt, numReleases, updatedAt);
  }

  /// @dev Returns the release data for the release associated with the given release hash.
  /// @param releaseHash The release hash.
  function getReleaseData(bytes32 releaseHash) constant returns (uint32 major,
                                                                 uint32 minor,
                                                                 uint32 patch,
                                                                 string preRelease,
                                                                 string build,
                                                                 string releaseLockFileURI,
                                                                 uint createdAt,
                                                                 uint updatedAt) {
    bytes32 versionHash;
    (,versionHash, createdAt, updatedAt) = releaseDb.getReleaseData(releaseHash);
    (major, minor, patch) = releaseDb.getMajorMinorPatch(versionHash);
    preRelease = getPreRelease(releaseHash);
    build = getBuild(releaseHash);
    releaseLockFileURI = getReleaseLockileURI(releaseHash);
    return (major, minor, patch, preRelease, build, releaseLockFileURI, createdAt, updatedAt);
  }

  /// @dev Returns the release data for the release at the provide index in the array of package releases.
  /// @param name Package name
  /// @param releaseIdx The index of the release to retrieve.
  function getReleaseData(string name,
                          uint releaseIdx) constant returns (uint32 major,
                                                             uint32 minor,
                                                             uint32 patch,
                                                             string preRelease,
                                                             string build,
                                                             string releaseLockFileURI,
                                                             uint createdAt,
                                                             uint updatedAt) {
    bytes32 nameHash = packageDb.hashName(name);
    bytes32 releaseHash = releaseDb.getReleaseHashForNameHash(nameHash, releaseIdx);
    return getReleaseData(releaseHash);
  }

  /// @dev Returns an array of all release hashes for the named package.
  /// @param name Package name
  function getAllReleaseHashes(string name) constant returns (bytes32[]) {
    bytes32 nameHash = packageDb.hashName(name);
    var (,,numReleases,) = getPackageData(name);
    bytes32[] memory releaseHashes = new bytes32[](numReleases);

    for (uint i = 0; i < numReleases; i++) {
      releaseHashes[i] = releaseDb.getReleaseHashForNameHash(nameHash, i);
    }

    return releaseHashes;
  }

  //
  // +----------------+
  // |  Internal API  |
  // +----------------+
  //
  /// @dev Returns boolean whether the provided address is the package owner
  /// @param name The name of the package
  /// @param _address The address to check
  function isPackageOwner(string name, address _address) internal returns (bool) {
    var (packageOwner,) = getPackageData(name);
    return (packageOwner != _address);
  }

  bytes4 constant GET_PACKAGE_NAME_SIG = bytes4(sha3("getPackageName(bytes32)"));

  /// @dev Retrieves the name for the given name hash.
  /// @param nameHash The name hash to lookup the name for.
  function getPackageName(bytes32 nameHash) internal returns (string) {
    return fetchString(address(packageDb), GET_PACKAGE_NAME_SIG, nameHash);
  }

  bytes4 constant GET_RELEASE_LOCKFILE_URI_SIG = bytes4(sha3("getReleaseLockileURI(bytes32)"));

  /// @dev Retrieves the release lockfile URI from the package db.
  /// @param releaseHash The release hash to retrieve the URI from.
  function getReleaseLockileURI(bytes32 releaseHash) internal returns (string) {
    return fetchString(address(releaseDb), GET_RELEASE_LOCKFILE_URI_SIG, releaseHash);
  }

  bytes4 constant GET_PRE_RELEASE_SIG = bytes4(sha3("getPreRelease(bytes32)"));

  /// @dev Retrieves the pre-release string from the package db.
  /// @param releaseHash The release hash to retrieve the string from.
  function getPreRelease(bytes32 releaseHash) internal returns (string) {
    return fetchString(address(releaseDb), GET_PRE_RELEASE_SIG, releaseHash);
  }

  bytes4 constant GET_BUILD_SIG = bytes4(sha3("getBuild(bytes32)"));

  /// @dev Retrieves the build string from the package db.
  /// @param releaseHash The release hash to retrieve the string from.
  function getBuild(bytes32 releaseHash) internal returns (string) {
    return fetchString(address(releaseDb), GET_BUILD_SIG, releaseHash);
  }

  /// @dev Retrieves a string from a function on the package db indicated by the provide function selector
  /// @param sig The 4-byte function selector to retrieve the signature from.
  /// @param arg The bytes32 argument that should be passed into the function.
  function fetchString(address codeAddress, bytes4 sig, bytes32 arg) internal constant returns (string s) {
    bool success;

    assembly {
      let m := mload(0x40) //Free memory pointer
      mstore(m,sig)
      mstore(add(m,4), arg) // Write arguments to memory- align directly after function sig.
      success := call( //Fetch string size
        sub(gas,8000), // g
        codeAddress,   // a
        0,             // v
        m,             // in
        0x24,          // insize: 4 byte sig + 32 byte uint
        add(m,0x24),   // Out pointer: don't overwrite the call data, we need it again
        0x40           // Only fetch the first 64 bytes of the string data.
      )
      let l := mload(add(m,0x44)) // returned data stats at 0x24, length is stored in the second 32-byte slot
      success :=  and(success,call(sub(gas,4000),codeAddress, 0,
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
