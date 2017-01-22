pragma solidity ^0.4.0;

/// @title Library implementing an array type which allows O(1) lookups on values.
/// @author Piper Merriam <pipermerriam@gmail.com>
library IndexedOrderedSetLib {
  struct IndexedOrderedSet {
    bytes32[] _values;
    mapping (bytes32 => uint) _valueIndices;
    mapping (bytes32 => bool) _exists;
  }

  modifier requireValue(IndexedOrderedSet storage self, bytes32 value) {
    if (contains(self, value)) {
      _;
    } else {
      throw;
    }
  }

  /// @dev Returns boolean if the key is in the array
  /// @param self The array
  /// @param value The value to check
  function contains(IndexedOrderedSet storage self, bytes32 value) constant returns (bool) {
    return self._exists[value];
  }

  /// @dev Returns the index of the value in the array.
  /// @param self The array
  /// @param value The value to look up the index for.
  function indexOf(IndexedOrderedSet storage self, bytes32 value) requireValue(self, value) 
                                                             constant 
                                                             returns (uint) {
    return self._valueIndices[value];
  }

  /// @dev Removes the element at index idx from the array and returns it.
  /// @param self The array
  /// @param idx The index to remove and return.
  function pop(IndexedOrderedSet storage self, uint idx) public returns (bytes32) {
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

  /// @dev Removes the element at index idx from the array
  /// @param self The array
  /// @param value The value to remove from the array.
  function remove(IndexedOrderedSet storage self, bytes32 value) requireValue(self, value)
                                                            public 
                                                            returns (bool) {
    uint idx = indexOf(self, value);
    pop(self, idx);
    return true;
  }

  /// @dev Retrieves the element at the provided index.
  /// @param self The array
  /// @param idx The index to retrieve.
  function get(IndexedOrderedSet storage self, uint idx) public returns (bytes32) {
    return self._values[idx];
  }

  /// @dev Pushes the new value onto the array
  /// @param self The array
  /// @param value The value to push.
  function add(IndexedOrderedSet storage self, bytes32 value) public returns (bool) {
    if (contains(self, value)) return true;

    self._valueIndices[value] = self._values.length;
    self._values.push(value);
    self._exists[value] = true;

    return true;
  }
}