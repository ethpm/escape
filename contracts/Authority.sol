pragma solidity ^0.4.0;


contract Authority {
    function canCall(address callerAddress,
                     address codeAddress,
                     bytes4 sig) constant returns (bool);
}


contract Authorized {
    address public owner;
    Authority public authority;

    event OwnerUpdate(address indexed oldOwner, address indexed newOwner);
    event AuthorityUpdate(address indexed oldAuthority, address indexed newAuthority);

    function Authorized() {
        owner = msg.sender;
        OwnerUpdate(0x0, owner);
    }

    function setOwner(address newOwner) auth {
        OwnerUpdate(owner, newOwner);
        owner = newOwner;
    }

    function setAuthority(Authority newAuthority) auth {
        AuthorityUpdate(authority, newAuthority);
        authority = newAuthority;
    }

    modifier auth {
        if (!isAuthorized()) throw;
        _;
    }

    function isAuthorized() internal returns (bool) {
        if (msg.sender == owner) {
            return true;
        } else if (address(authority) == (0)) {
            return false;
        } else {
            return authority.canCall(msg.sender, this, msg.sig);
        }
    }
}


contract WhitelistAuthority is Authority, Authorized {
    mapping (address =>
             mapping (address =>
                      mapping (bytes4 => bool))) _canCall;
    mapping (address => mapping (bytes4 => bool)) _anyoneCanCall;

    event SetCanCall(address indexed callerAddress,
                     address indexed codeAddress,
                     bytes4 indexed sig,
                     bool can);

    event SetAnyoneCanCall(address indexed codeAddress,
                           bytes4 indexed sig,
                           bool can);

    function canCall(address callerAddress,
                     address codeAddress,
                     bytes4 sig) constant returns (bool) {
        if (_anyoneCanCall[codeAddress][sig]) {
          return true;
        } else {
          return _canCall[callerAddress][codeAddress][sig];
        }
    }

    function setCanCall(address callerAddress,
                        address codeAddress,
                        bytes4 sig,
                        bool can) auth public returns (bool) {
        _canCall[callerAddress][codeAddress][sig] = can;
        SetCanCall(callerAddress, codeAddress, sig, can);
        return true;
    }

    function setAnyoneCanCall(address codeAddress,
                              bytes4 sig,
                              bool can) auth public returns (bool) {
        _anyoneCanCall[codeAddress][sig] = can;
        SetAnyoneCanCall(codeAddress, sig, can);
        return true;
    }
}
