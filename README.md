# A Dummy Package Index Contract

For testing!


On Ropsten @ [0x0f50896C956E8DC16a0eD127Cb8E253ba6C8BD8e ](https://testnet.etherscan.io/address/0x0f50896c956e8dc16a0ed127cb8e253ba6c8bd8e)


## API


```javascript
contract PackageIndexInterface {
    function register(bytes32 name) public returns (bool);

    function release(bytes32 name,
                     uint32 major,
                     uint32 minor,
                     uint32 patch,
                     string releaseLockFileURI) public returns (bool);

    function latestVersion(bytes32 name) constant returns (uint32 major,
                                                           uint32 minor,
                                                           uint32 patch,
                                                           string releaseLockFileURI);

    function exists(bytes32 name) constant returns (bool);

    function getOwner(bytes32 name) constant returns (address);

    function numReleases(bytes32 name) constant returns (uint);

    function getRelease(bytes32 name, uint releaseIdx) constant returns (uint major,
                                                                         uint minor,
                                                                         uint patch,
                                                                         string releaseLockFileURI);

    function getReleaseLockFile(bytes32 name,
                                uint major,
                                uint minor,
                                uint patch) constant returns (string);
}
```

## ABI

Pretty

```javascript
[
  {
    "constant": true,
    "inputs": [
      {
        "name": "name",
        "type": "bytes32"
      },
      {
        "name": "major",
        "type": "uint256"
      },
      {
        "name": "minor",
        "type": "uint256"
      },
      {
        "name": "patch",
        "type": "uint256"
      }
    ],
    "name": "getReleaseLockFile",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "name",
        "type": "bytes32"
      },
      {
        "name": "releaseIdx",
        "type": "uint256"
      }
    ],
    "name": "getRelease",
    "outputs": [
      {
        "name": "major",
        "type": "uint256"
      },
      {
        "name": "minor",
        "type": "uint256"
      },
      {
        "name": "patch",
        "type": "uint256"
      },
      {
        "name": "releaseLockFileURI",
        "type": "string"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "name",
        "type": "bytes32"
      }
    ],
    "name": "exists",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "name",
        "type": "bytes32"
      },
      {
        "name": "major",
        "type": "uint32"
      },
      {
        "name": "minor",
        "type": "uint32"
      },
      {
        "name": "patch",
        "type": "uint32"
      },
      {
        "name": "releaseLockFileURI",
        "type": "string"
      }
    ],
    "name": "release",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "name",
        "type": "bytes32"
      }
    ],
    "name": "numReleases",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "name",
        "type": "bytes32"
      }
    ],
    "name": "getOwner",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "name",
        "type": "bytes32"
      }
    ],
    "name": "register",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "name",
        "type": "bytes32"
      }
    ],
    "name": "latestVersion",
    "outputs": [
      {
        "name": "major",
        "type": "uint32"
      },
      {
        "name": "minor",
        "type": "uint32"
      },
      {
        "name": "patch",
        "type": "uint32"
      },
      {
        "name": "releaseLockFileURI",
        "type": "string"
      }
    ],
    "payable": false,
    "type": "function"
  }
]
```

Fugly

```javascript
[{"constant":true,"inputs":[{"name":"name","type":"bytes32"},{"name":"major","type":"uint256"},{"name":"minor","type":"uint256"},{"name":"patch","type":"uint256"}],"name":"getReleaseLockFile","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"},{"name":"releaseIdx","type":"uint256"}],"name":"getRelease","outputs":[{"name":"major","type":"uint256"},{"name":"minor","type":"uint256"},{"name":"patch","type":"uint256"},{"name":"releaseLockFileURI","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"exists","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"},{"name":"major","type":"uint32"},{"name":"minor","type":"uint32"},{"name":"patch","type":"uint32"},{"name":"releaseLockFileURI","type":"string"}],"name":"release","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"numReleases","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"getOwner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"}],"name":"register","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"latestVersion","outputs":[{"name":"major","type":"uint32"},{"name":"minor","type":"uint32"},{"name":"patch","type":"uint32"},{"name":"releaseLockFileURI","type":"string"}],"payable":false,"type":"function"}]
```
