pragma solidity ^0.4.0;

library EnumerableMappingLib {
  struct EnumerableMapping {
    bytes32[] _keys;
    mapping (bytes32 => string) _values;
    mapping (bytes32 => uint) _valueIndices;
    mapping (bytes32 => bool) _hasKey;
  }

  function contains(EnumerableMapping storage self, bytes32 key) constant returns (bool) {
    return self._hasKey[key];
  }

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

  function push(EnumerableMapping storage self,
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
