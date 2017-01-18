import pytest

from ethereum.tester import TransactionFailed
from web3.utils.abi import function_signature_to_4byte_selector
from web3.utils.encoding import decode_hex


@pytest.fixture()
def authority(chain):
    _authority = chain.get_contract('WhitelistAuthority')
    return _authority


@pytest.fixture()
def package_db(chain, authority):
    _package_db = chain.get_contract('PackageDB')
    chain.wait.for_receipt(_package_db.transact().setAuthority(authority.address))
    assert _package_db.call().authority() == authority.address
    return _package_db


@pytest.fixture()
def package_index(chain, package_db, authority):
    _package_index = chain.get_contract('PackageIndex', deploy_args=[package_db.address])

    chain.wait.for_receipt(authority.transact().setCanCall(
        callerAddress=_package_index.address,
        codeAddress=package_db.address,
        functionSignature="setRelease(string,uint32,uint32,uint32,string,string,string)",
        can=True,
    ))
    chain.wait.for_receipt(authority.transact().setCanCall(
        callerAddress=_package_index.address,
        codeAddress=package_db.address,
        functionSignature="setPackageOwner(string,address)",
        can=True,
    ))
    chain.wait.for_receipt(authority.transact().setCanCall(
        callerAddress=_package_index.address,
        codeAddress=package_db.address,
        functionSignature="setVersion(uint32,uint32,uint32,string,string)",
        can=True,
    ))
    assert authority.call().canCall(
        _package_index.address,
        package_db.address,
        decode_hex(function_signature_to_4byte_selector("setRelease(string,uint32,uint32,uint32,string,string,string)")),
    )
    assert authority.call().canCall(
        _package_index.address,
        package_db.address,
        decode_hex(function_signature_to_4byte_selector("setPackageOwner(string,address)")),
    )
    assert authority.call().canCall(
        _package_index.address,
        package_db.address,
        decode_hex(function_signature_to_4byte_selector("setVersion(uint32,uint32,uint32,string,string)")),
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

    assert package_index.call().getOwner(package_name) == package_owner

    return package_name


NULL_ADDRESS = '0x0000000000000000000000000000000000000000'


def test_registering_package(chain, web3, package_index):
    assert package_index.call().getOwner('test') == NULL_ADDRESS

    chain.wait.for_receipt(package_index.transact().release(
        name='test-package',
        major=1,
        minor=2,
        patch=3,
        preRelease='',
        build='',
        releaseLockFileURI='ipfs://not-a-real-uri',
    ))

    assert package_index.call().getOwner('test-package') == web3.eth.coinbase


def test_cannot_register_existing_package(chain,
                                          package_index,
                                          test_package,
                                          package_owner):
    assert package_index.call().getOwner(test_package) == package_owner

    with pytest.raises(TransactionFailed):
        package_index.transact().release(
            name=test_package,
            major=2,
            minor=0,
            patch=0,
            preRelease='',
            build='',
            releaseLockFileURI='ipfs://not-a-real-uri',
        )

    assert package_index.call().getOwner(test_package) == package_owner


def test_cannot_register_version_0(chain,
                                   package_index,
                                   test_package,
                                   package_owner):
    assert package_index.call().getNumReleases(test_package) == 1

    chain.wait.for_receipt(package_index.transact({
        'from': package_owner,
    }).release(test_package, 0, 0, 0, '', '', 'ipfs://not-a-uri'))

    assert package_index.call().getNumReleases(test_package) == 1


def test_latest_version_tracking(chain, package_db, package_index):
    chain.wait.for_receipt(package_index.transact().release(
        'test', 1, 0, 0, '', '', ''
    ))

    assert package_index.call().getLatestVersion('test') == [1, 0, 0, '', '', '']

    chain.wait.for_receipt(package_index.transact().release(
        'test', 1, 1, 0, '', '', ''
    ))

    assert package_index.call().getLatestVersion('test') == [1, 1, 0, '', '', '']

    chain.wait.for_receipt(package_index.transact().release(
        'test', 1, 0, 1, '', '', ''
    ))

    assert package_index.call().getLatestVersion('test') == [1, 1, 0, '', '', '']

    chain.wait.for_receipt(package_index.transact().release(
        'test', 2, 0, 0, '', '', ''
    ))

    assert package_index.call().getLatestVersion('test') == [2, 0, 0, '', '', '']


def test_querying_package_information(chain, web3, package_index):
    chain.wait.for_receipt(package_index.transact().release('test', 1, 2, 3, 'a', 'b', 'ipfs://uri-a'))
    chain.wait.for_receipt(package_index.transact().release('test', 2, 3, 4, 'c', 'd', 'ipfs://uri-b'))
    chain.wait.for_receipt(package_index.transact().release('test', 3, 4, 5, 'e', 'f', 'ipfs://uri-c'))

    assert package_index.call().getOwner('test') == web3.eth.coinbase

    assert package_index.call().numReleases('test') == 3
    assert package_index.call().getRelease('test', 0) == [1, 2, 3, 'a', 'b', 'ipfs://uri-a']
    assert package_index.call().getRelease('test', 1) == [2, 3, 4, 'c', 'd', 'ipfs://uri-b']
    assert package_index.call().getRelease('test', 2) == [3, 4, 5, 'e', 'f', 'ipfs://uri-c']
