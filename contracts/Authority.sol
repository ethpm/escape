contract Authority {
    function canCall(address callerAddress,
                     address codeAddress,
                     bytes4 sig) constant returns (bool);
}


contract Authorized {
    address public owner;
    Authority public authority;

    event OwnerUpdate(address indexed owner);
    event AuthorityUpdate(address indexed authority);

    function Authorized() {
        owner = msg.sender;
        OwnerUpdate(owner);
    }

    function setOwner(address newOwner) auth {
        owner = newOwner;
        OwnerUpdate(owner);
    }

    function setAuthority(Authority newAuthority) auth {
        authority = newAuthority;
        AuthorityUpdate(authority);
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

    event SetCanCall(address indexed callerAddress,
                     address indexed codeAddress,
                     bytes4 indexed sig,
                     bool can);

    function canCall(address callerAddress,
                     address codeAddress,
                     bytes4 sig ) constant returns (bool) {
        return _canCall[callerAddress][codeAddress][sig];
    }

    function setCanCall(address callerAddress,
                        address codeAddress,
                        bytes4 sig,
                        bool can ) auth public returns (bool) {
        _canCall[callerAddress][codeAddress][sig] = can;
        SetCanCall( callerAddress, codeAddress, sig, can );
        return true;
    }
}
