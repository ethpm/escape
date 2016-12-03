pragma solidity ^0.4.0;


import {SemVersionLib} from "./SemVersionLib.sol";


library PackageLib {
    using SemVersionLib for SemVersionLib.Version;

    struct Package {
        address owner;
        bytes32 name;
        SemVersionLib.Version latest;
        SemVersionLib.Version[] releases;
        mapping (bytes32 => bool) exists;
        mapping (bytes32 => string) releaseLockFiles;
    }

    function initialize(Package storage self,
                        address owner,
                        bytes32 name) public returns (bool) {
        self.owner = owner;
        self.name = name;

        return true;
    }

    function publishRelease(Package storage self,
                            uint32 major,
                            uint32 minor,
                            uint32 patch,
                            string releaseLockFileURI) public returns (bool) {
        var versionHash = sha3(major, minor, patch);

        if (self.exists[versionHash]) {
            // this version has already been released
            return false;
        }

        self.releases.push(SemVersionLib.Version({
            major: major,
            minor: minor,
            patch: patch
        }));
        self.releaseLockFiles[versionHash] = releaseLockFileURI;

        if (self.releases[self.releases.length - 1].isGreaterOrEqual(self.latest)) {
            self.latest = self.releases[self.releases.length - 1];
        }

        return true;
    }
}
