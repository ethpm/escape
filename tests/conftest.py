import pytest

from web3.utils.abi import function_signature_to_4byte_selector
from web3.utils.encoding import decode_hex


@pytest.fixture()
def authority(chain):
    _authority = chain.get_contract('WhitelistAuthority')
    return _authority


@pytest.fixture()
def authorize_call(authority):
    def _authorize_call(caller_address, code_address, can_call, function_signature):
        sig = decode_hex(function_signature_to_4byte_selector(function_signature))
        chain.wait.for_receipt(authority.transact().setCanCall(
            callerAddress=caller_address,
            codeAddress=code_address,
            sig=sig,
            can=can_call,
        ))
        assert authority.call().canCall(
            callerAddress=caller_address,
            codeAddress=code_address,
            sig=sig,
        )
    return _authorize_call


@pytest.fixture()
def whitelist_call(authority):
    def _whitelist_call(code_address, can_call, function_signature):
        sig = decode_hex(function_signature_to_4byte_selector(function_signature))
        chain.wait.for_receipt(authority.transact().setAnyoneCanCall(
            codeAddress=code_address,
            sig=sig,
            can=can_call,
        ))
        assert authority.call().canCall(
            '0x0000000000000000000000000000000000000000',
            callerAddress=caller_address,
            codeAddress=code_address,
            sig=sig,
        )
    return _whitelist_call


@pytest.fixture()
def package_db(chain, authority):
    _package_db = chain.get_contract('PackageDB')
    chain.wait.for_receipt(_package_db.transact().setAuthority(authority.address))
    assert _package_db.call().authority() == authority.address
    return _package_db


@pytest.fixture()
def package_index(chain, package_db, authority, authorize_call, whitelist_call):
    _package_index = chain.get_contract('PackageIndex', deploy_args=[package_db.address])
    chain.wait.for_receipt(_package_index.transact().setAuthority(authority.address))
    assert _package_index.call().authority() == authority.address

    authorize_call(
        _package_index.address,
        package_db.address,
        "setRelease(string,uint32,uint32,uint32,string,string,string)",
        True,
    )
    authorize_call(
        _package_index.address,
        package_db.address,
        "setPackageOwner(string,address)",
        True,
    )
    authorize_call(
        _package_index.address,
        package_db.address,
        "setVersion(uint32,uint32,uint32,string,string)",
        True,
    )
    authorize_call(
        _package_index.address,
        "release(string,uint32,uint32,uint32,string,string,string)",
        True,
    )
    whitelist_call(
        _package_index.address,
        "transferOwnership(string,address)",
        True,
    )

    return _package_index


@pytest.fixture()
def package_owner(web3):
    return web3.eth.accounts[1]


@pytest.fixture()
def test_package(chain, package_index, package_owner):
    package_name = 'test-package'

    chain.wait.for_receipt(package_index.transact({
        'from': package_owner,
    }).release(
        name=package_name,
        major=1,
        minor=2,
        patch=3,
        preRelease='',
        build='',
        releaseLockFileURI='ipfs://not-a-real-uri',
    ))

    assert package_index.call().getPackageOwner(package_name) == package_owner

    return package_name
