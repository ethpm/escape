import pytest

from ethereum.tester import TransactionFailed


@pytest.fixture()
def package_db(chain):
    package_db = chain.get_contract('PackageDB')
    return package_db


@pytest.fixture()
def package_index(chain, package_db):
    package_index = chain.get_contract('PackageIndex', deploy_args=[package_db.address])

    set_owner_txn_hash = package_db.transact().setOwner(package_index.address)
    chain.wait.for_receipt(set_owner_txn_hash)
    assert package_db.call().owner() == package_index.address

    return package_index


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
    assert package_index.call().numReleases(test_package) == 1

    chain.wait.for_receipt(package_index.transact({
        'from': package_owner,
    }).release(test_package, 0, 0, 0, '', '', 'ipfs://not-a-uri'))

    assert package_index.call().numReleases(test_package) == 1


def test_latest_version_tracking(chain, package_index):
    chain.wait.for_receipt(package_index.transact().release(
        'test', 1, 0, 0, '', '', ''
    ))

    assert package_index.call({'gas': 3100000}).latestVersion('test') == [1, 0, 0, '', '', '']

    chain.wait.for_receipt(package_index.transact().release(
        'test', 1, 1, 0, '', '', ''
    ))

    assert package_index.call().latestVersion('test') == [1, 1, 0, '', '', '']

    chain.wait.for_receipt(package_index.transact().release(
        'test', 1, 0, 1, '', '', ''
    ))

    assert package_index.call().latestVersion('test') == [1, 1, 0, '', '', '']

    chain.wait.for_receipt(package_index.transact().release(
        'test', 2, 0, 0, '', '', ''
    ))

    assert package_index.call().latestVersion('test') == [2, 0, 0, '', '', '']


def test_querying_package_information(chain, web3, package_index):
    chain.wait.for_receipt(package_index.transact().release('test', 1, 0, 0, 'a', 'b', 'ipfs://uri-a'))
    chain.wait.for_receipt(package_index.transact().release('test', 2, 0, 0, 'c', 'd', 'ipfs://uri-b'))
    chain.wait.for_receipt(package_index.transact().release('test', 3, 0, 0, 'e', 'f', 'ipfs://uri-c'))

    assert package_index.call().getOwner('test') == web3.eth.coinbase

    assert package_index.call().numReleases('test') == 3
    assert package_index.call().getRelease('test', 0) == [1, 0, 0, 'a', 'b', 'ipfs://uri-a']
    assert package_index.call().getRelease('test', 1) == [2, 0, 0, 'c', 'd', 'ipfs://uri-b']
    assert package_index.call().getRelease('test', 2) == [3, 0, 0, 'e', 'f', 'ipfs://uri-c']
