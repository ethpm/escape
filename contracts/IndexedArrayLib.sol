pragma solidity ^0.4.0;

library IndexedArrayLib {
  struct IndexedArray {
    bytes32[] _values;
    mapping (bytes32 => uint) _valueIndices;
    mapping (bytes32 => bool) _exists;
  }

  modifier requireValue(IndexedArray storage self, bytes32 value) {
    if (contains(self, value)) {
      _;
    } else {
      throw;
    }
  }

  function contains(IndexedArray storage self, bytes32 value) constant returns (bool) {
    return self._exists[value];
  }

  function indexOf(IndexedArray storage self, bytes32 value) requireValue(self, value) 
                                                             constant 
                                                             returns (uint) {
    return self._valueIndices[value];
  }

  function pop(IndexedArray storage self, uint idx) public returns (bytes32) {
    bytes32 value = get(self, idx);

    if (idx != self._values.length - 1) {
      bytes32 movedValue = self._values[self._values.length - 1];
      self._values[idx] = movedValue;
      self._valueIndices[movedValue] = idx;
    }
    self._values.length -= 1;

    delete self._valueIndices[value];
    delete self._exists[value];

    return value;
  }

  function remove(IndexedArray storage self, bytes32 value) requireValue(self, value)
                                                            public 
                                                            returns (bool) {
    uint idx = indexOf(self, value);
    pop(self, idx);
    return true;
  }

  function get(IndexedArray storage self, uint idx) public returns (bytes32) {
    return self._values[idx];
  }

  function push(IndexedArray storage self, bytes32 value) public returns (bool) {
    // no duplicates for now.
    if (contains(self, value)) throw;

    self._valueIndices[value] = self._values.length;
    self._values.push(value);
    self._exists[value] = true;

    return true;
  }
}
