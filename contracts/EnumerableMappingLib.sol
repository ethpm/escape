pragma solidity ^0.4.0;

/// @title Library implementing a data type that allows enumeration over the keys which are set in a mapping as well as knowledge that a key is set.
/// @author Piper Merriam <pipermerriam@gmail.com>
library EnumerableMappingLib {
  struct EnumerableMapping {
    bytes32[] _keys;
    mapping (bytes32 => string) _values;
    mapping (bytes32 => uint) _valueIndices;
    mapping (bytes32 => bool) _hasKey;
  }

  /// @dev Returns boolean if the key is in the mapping
  /// @param self The mapping
  /// @param key The key to check
  function contains(EnumerableMapping storage self, bytes32 key) constant returns (bool) {
    return self._hasKey[key];
  }

  /// @dev Remove the key from the mapping if present.  Return boolean indicating if the value was removed.
  /// @param self The mapping
  /// @param key The key to remove
  function remove(EnumerableMapping storage self, bytes32 key) public returns (bool) {
    if (!contains(self, key)) {
      return false;
    }

    uint keyIndex = self._valueIndices[key];
    if (keyIndex != self._keys.length - 1) {
      bytes32 swappedKey = self._keys[self._keys.length - 1];
      self._keys[keyIndex] = swappedKey;
      self._valueIndices[swappedKey] = keyIndex;
    }
    self._keys.length -= 1;

    delete self._valueIndices[key];
    delete self._values[key];
    delete self._hasKey[key];

    return true;
  }

  /// @dev Add the value to the mapping.
  /// @param self The mapping
  /// @param key The key to add
  function set(EnumerableMapping storage self,
                bytes32 key,
                string value) public returns (bool) {
    if (contains(self, key)) {
      remove(self, key);
    }

    self._valueIndices[key] = self._keys.length;
    self._keys.push(key);
    self._values[key] = value;
    self._hasKey[key] = true;
  }
}
