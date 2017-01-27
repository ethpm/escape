pragma solidity ^0.4.0;


contract Authority {
    function canCall(address callerAddress,
                     address codeAddress,
                     bytes4 sig) constant returns (bool);
}


contract AuthorizedInterface {
    address public owner;
    Authority public authority;

    modifier auth {
        if (!isAuthorized()) throw;
        _;
    }

    event OwnerUpdate(address indexed oldOwner, address indexed newOwner);
    event AuthorityUpdate(address indexed oldAuthority, address indexed newAuthority);

    function setOwner(address newOwner) public auth returns (bool);

    function setAuthority(Authority newAuthority) public auth returns (bool);

    function isAuthorized() internal returns (bool);
}


contract Authorized is AuthorizedInterface {
    function Authorized() {
        owner = msg.sender;
        OwnerUpdate(0x0, owner);
    }

    function setOwner(address newOwner) public auth returns (bool) {
        OwnerUpdate(owner, newOwner);
        owner = newOwner;
        return true;
    }

    function setAuthority(Authority newAuthority) public auth returns (bool) {
        AuthorityUpdate(authority, newAuthority);
        authority = newAuthority;
        return true;
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


contract WhitelistAuthorityInterface is Authority, AuthorizedInterface {
    event SetCanCall(address indexed callerAddress,
                     address indexed codeAddress,
                     bytes4 indexed sig,
                     bool can);

    event SetAnyoneCanCall(address indexed codeAddress,
                           bytes4 indexed sig,
                           bool can);

    function setCanCall(address callerAddress,
                        address codeAddress,
                        bytes4 sig,
                        bool can) auth public returns (bool);

    function setAnyoneCanCall(address codeAddress,
                              bytes4 sig,
                              bool can) auth public returns (bool);
}


contract WhitelistAuthority is WhitelistAuthorityInterface, Authorized {
    mapping (address =>
             mapping (address =>
                      mapping (bytes4 => bool))) _canCall;
    mapping (address => mapping (bytes4 => bool)) _anyoneCanCall;

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
