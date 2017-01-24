pragma solidity ^0.4.0;

/// @title Library which implements a semver datatype and comparisons.
/// @author Piper Merriam <pipermerriam@gmail.com>
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

  /// @dev Initialize a SemVersion struct
  /// @param self The SemVersion object to initialize.
  /// @param major The major portion of the semver version string.
  /// @param minor The minor portion of the semver version string.
  /// @param patch The patch portion of the semver version string.
  /// @param preRelease The pre-release portion of the semver version string.  Use empty string if the version string has no pre-release portion.
  /// @param build The build portion of the semver version string.  Use empty string if the version string has no build portion.
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
  /// @dev Return boolean indicating if the two SemVersion objects are considered equal
  /// @param self The first SemVersion
  /// @param other The second SemVersion
  function isEqual(SemVersion storage self, SemVersion storage other) public returns (bool) {
    return self.hash == other.hash;
  }

  /// @dev Return boolean indicating if the first SemVersion object is considered strictly greater than the second.
  /// @param self The first SemVersion
  /// @param other The second SemVersion
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

  /// @dev Return boolean indicating if the first SemVersion object is considered greater than or equal to the second.
  /// @param self The first SemVersion
  /// @param other The second SemVersion
  function isGreaterOrEqual(SemVersion storage self, SemVersion storage other) public returns (bool) {
    return isEqual(self, other) || isGreater(self, other);
  }

  /*
   *  PreRelease comparisons
   */
  /// @dev Return boolean indicating if the pre-release string from the first SemVersion object is considered greater than the pre-release string from the second SemVersion object.
  /// @param left The first SemVersion
  /// @param right The second SemVersion
  function isPreReleaseGreater(SemVersion storage left, SemVersion storage right) internal returns (bool) {
    return comparePreReleases(left, right) == Comparison.After;
  }

  /// @dev Return boolean indicating if the provided SemVersion is a pre-release.
  /// @param self The SemVersion
  function isPreRelease(SemVersion storage self) internal returns (bool) {
    return self.preReleaseIdentifiers.length > 0;
  }

  /// @dev Return a comparison of the pre-release strings for the two provided SemVersion objects.
  /// @param left The first SemVersion
  /// @param right The second SemVersion
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
  /// @dev Return a comparison based on the ASCII ordering of the two strings
  /// @param left The first string
  /// @param right The second string
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

  /// @dev Return a comparison based on the integer representation of the two string.
  /// @param left The first string
  /// @param right The second string
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

  /// @dev Splits a string on periods.
  /// @param preRelease The string to split.
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
  /// @dev Returns the minimum of two unsigned integers
  /// @param a The first unsigned integer
  /// @param b The first unsigned integer
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

  /// @dev Returns boolean indicating if the provided character is a numeric digit.
  /// @param v The character to check.
  function isDigit(bytes1 v) internal returns (bool) {
    return (uint(v) >= DIGIT_0 && uint(v) <= DIGIT_9);
  }

  //
  // String Utils
  //
  /// @dev Returns boolean indicating if the provided string is all numeric.
  /// @param value The string to check.
  function isNumericString(string value) internal returns (bool) {
    for (uint i = 0; i < bytes(value).length; i++) {
      if (!isDigit(bytes(value)[i])) {
        return false;
      }
    }

    return bytes(value).length > 0;
  }

  /// @dev Returns the integer representation of a numeric string.
  /// @param numericString The string to convert.
  function castStringToUInt(string numericString) internal returns (uint) {
    uint value = 0;

    for (uint i = 0; i < bytes(numericString).length; i++) {
      value *= 10;
      value += uint(bytes(numericString)[i]) - 48;
    }

    return value;
  }

  /// @dev Concatenates the two strings together.
  /// @param _head The first string
  /// @param tail The second string
  function concat(string storage _head, string tail) returns (bool) {
    bytes head = bytes(_head);

    for (uint i = 0; i < bytes(tail).length; i++) {
      head.push(bytes(tail)[i]);
    }

    _head = string(head);

    return true;
  }

  /// @dev Concatenates the provided byte to the end of the provided string.
  /// @param value The string to append the byte to.
  /// @param b The byte.
  function concatByte(string storage value, bytes1 b) returns (bool) {
    bytes memory _b = new bytes(1);
    _b[0] = b;
    return concat(value, string(_b));
  }
}
