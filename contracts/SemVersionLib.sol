pragma solidity ^0.4.0;


library SemVersionLib {
    struct SemVersion {
        bytes32 hash;
        uint32 major;
        uint32 minor;
        uint32 patch;
        string preRelease;
        string build;
        string[] preReleaseIdentifiers;
    }

    enum Comparison {
        Before,
        Same,
        After
    }

    function init(SemVersion storage self,
                  uint32 major,
                  uint32 minor,
                  uint32 patch,
                  string preRelease,
                  string build) public returns (bool) {
        self.major = major;
        self.minor = minor;
        self.patch = patch;
        self.preRelease = preRelease;
        self.preReleaseIdentifiers = splitIdentifiers(preRelease);
        self.build = build;
        self.hash = sha3(major, minor, patch, preRelease);
        return true;
    }

    //
    // Storage Operations
    //
    function isEqual(SemVersion storage self, SemVersion storage other) public returns (bool) {
        return self.hash == other.hash;
    }

    function isGreater(SemVersion storage self, SemVersion storage other) public returns (bool) {
        if (self.hash == other.hash) {
            return false;
        } else if (self.major > other.major) {
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
        } else if (!isPreRelease(self) && isPreRelease(other)) {
            return true;
        } else if (isPreRelease(self) && !isPreRelease(other)) {
            return false;
        } else if (isPreReleaseGreater(self, other)) {
            return true;
        } else {
            return false;
        }
    }

    function isGreaterOrEqual(SemVersion storage self, SemVersion storage other) public returns (bool) {
        return isEqual(self, other) || isGreater(self, other);
    }

    /*
     *  PreRelease comparisons
     */
    function isPreReleaseGreater(SemVersion storage left, SemVersion storage right) internal returns (bool) {
        return comparePreReleases(left, right) == Comparison.After;
    }

    function isPreRelease(SemVersion storage self) internal returns (bool) {
        return self.preReleaseIdentifiers.length > 0;
    }

    function comparePreReleases(SemVersion storage left, SemVersion storage right) internal returns (Comparison comparisonResult) {
        uint minLength = min(left.preReleaseIdentifiers.length,
                             right.preReleaseIdentifiers.length);
        for (uint i = 0; i < minLength; i++) {
            if (isNumericString(left.preReleaseIdentifiers[i]) && isNumericString(right.preReleaseIdentifiers[i])) {
                comparisonResult = compareNumericStrings(left.preReleaseIdentifiers[i], right.preReleaseIdentifiers[i]);
            } else {
                comparisonResult = compareStrings(left.preReleaseIdentifiers[i], right.preReleaseIdentifiers[i]);
            }

            if (comparisonResult != Comparison.Same) {
                return comparisonResult;
            }
            continue;
        }

        if (left.preReleaseIdentifiers.length < right.preReleaseIdentifiers.length) {
            return Comparison.Before;
        } else if (left.preReleaseIdentifiers.length > right.preReleaseIdentifiers.length) {
            return Comparison.After;
        } else {
            return Comparison.Same;
        }
    }

    //
    // PreRelease String Utils
    //
    function compareStrings(string left, string right) internal returns (Comparison) {
        for (uint i = 0; i < min(bytes(left).length, bytes(right).length); i++) {
            if (bytes(left)[i] == bytes(right)[i]) {
                continue;
            } else if (uint(bytes(left)[i]) < uint(bytes(right)[i])) {
                return Comparison.Before;
            } else {
                return Comparison.After;
            }
        }

        if (bytes(left).length < bytes(right).length) {
            return Comparison.Before;
        } else if (bytes(left).length > bytes(right).length) {
            return Comparison.After;
        } else {
            return Comparison.Same;
        }
    }

    function compareNumericStrings(string left, string right) internal returns (Comparison) {
        uint leftAsNumber = castStringToUInt(left);
        uint rightAsNumber = castStringToUInt(right);

        if (leftAsNumber < rightAsNumber) {
            return Comparison.Before;
        } else if (leftAsNumber > rightAsNumber) {
            return Comparison.After;
        } else {
            return Comparison.Same;
        }
    }

    function splitIdentifiers(string preRelease) internal returns (string[]) {
        if (bytes(preRelease).length == 0) {
            return new string[](0);
        }
        
        uint i;
        uint leftBound = 0;
        uint numIdentifiers = 1;

        for (i = 0; i < bytes(preRelease).length; i++) {
            if (bytes(preRelease)[i] == PERIOD) {
                numIdentifiers += 1;
            }
        }

        string[] memory preReleaseIdentifiers = new string[](numIdentifiers);

        numIdentifiers = 0;

        for (i = 0; i <= bytes(preRelease).length; i++) {
            if (i == bytes(preRelease).length || bytes(preRelease)[i] == PERIOD) {
                uint identifierLength = i - leftBound;

                bytes memory buffer = new bytes(identifierLength);
                for (uint j = 0; j < identifierLength; j++) {
                    buffer[j] = bytes(preRelease)[j + leftBound];
                }
                preReleaseIdentifiers[numIdentifiers] = string(buffer);
                leftBound = i + 1;
                numIdentifiers += 1;
            }
        }
        return preReleaseIdentifiers;
    }

    //
    // Math utils
    //
    function min(uint a, uint b) internal returns (uint) {
        if (a <= b) {
            return a;
        } else {
            return b;
        }
    }

    //
    // Char Utils
    //
    uint constant DIGIT_0 = uint(bytes1('0'));
    uint constant DIGIT_9 = uint(bytes1('9'));
    bytes1 constant PERIOD = bytes1('.');

    function isDigit(bytes1 v) internal returns (bool) {
        return (uint(v) >= DIGIT_0 && uint(v) <= DIGIT_9);
    }

    //
    // String Utils
    //
    function isNumericString(string value) internal returns (bool) {
        for (uint i = 0; i < bytes(value).length; i++) {
            if (!isDigit(bytes(value)[i])) {
                return false;
            }
        }

        return bytes(value).length > 0;
    }

    function castStringToUInt(string numericString) internal returns (uint) {
        uint value = 0;

        for (uint i = 0; i < bytes(numericString).length; i++) {
            value *= 10;
            value += uint(bytes(numericString)[i]) - 48;
        }

        return value;
    }

    function concat(string storage _head, string tail) returns (bool) {
        bytes head = bytes(_head);

        for (uint i = 0; i < bytes(tail).length; i++) {
            head.push(bytes(tail)[i]);
        }

        _head = string(head);

        return true;
    }

    function concatByte(string storage value, bytes1 b) returns (bool) {
        bytes memory _b = new bytes(1);
        _b[0] = b;
        return concat(value, string(_b));
    }
}
