pragma solidity ^0.4.0;


library SemVersionLib {
    struct Version {
        uint32 major;
        uint32 minor;
        uint32 patch;
    }

    function isEqual(Version storage self, Version storage other) public returns (bool) {
        if (self.major != other.major) {
            return false;
        } else if (self.minor != other.minor) {
            return false;
        } else if (self.patch != other.patch) {
            return false;
        } else {
            return true;
        }
    }

    function isGreater(Version storage self, Version storage other) public returns (bool) {
        if (self.major > other.major) {
            return true;
        } else if (self.major < other.major) {
            return false;
        } else if (self.minor > other.minor) {
            return true;
        } else if (self.minor < other.minor) {
            return false;
        } else if (self.patch > other.patch) {
            return true;
        } else if (self.patch < other.patch) {
            return false;
        } else {
            return false;
        }
    }

    function isLesser(Version storage self, Version storage other) public returns (bool) {
        if (self.major < other.major) {
            return true;
        } else if (self.major > other.major) {
            return false;
        } else if (self.minor < other.minor) {
            return true;
        } else if (self.minor > other.minor) {
            return false;
        } else if (self.patch < other.patch) {
            return true;
        } else if (self.patch > other.patch) {
            return false;
        } else {
            return false;
        }
    }

    function isGreaterOrEqual(Version storage self, Version storage other) public returns (bool) {
        return isEqual(self, other) || isGreater(self, other);
    }

    function isLesserOrEqual(Version storage self, Version storage other) public returns (bool) {
        return isEqual(self, other) || isLesser(self, other);
    }
}
