import pytest


@pytest.fixture()
def package_index(chain):
    package_index = chain.get_contract('PackageIndex')
    return package_index


@pytest.fixture()
def package_owner(web3):
    return web3.eth.accounts[1]


@pytest.fixture()
def registered_package(chain, web3, package_index, package_owner):
    package_name = 'test'

    chain.wait.for_receipt(package_index.transact({
        'from': package_owner,
    }).register(package_name))

    assert package_index.call().getOwner(package_name) == package_owner

    return package_name


NULL_ADDRESS = '0x0000000000000000000000000000000000000000'


def test_registering_package(chain, web3, package_index):
    assert package_index.call().getOwner('test') == NULL_ADDRESS

    chain.wait.for_receipt(package_index.transact().register('test'))

    assert package_index.call().getOwner('test') == web3.eth.coinbase


def test_cannot_register_existing_package(chain,
                                          package_index,
                                          registered_package,
                                          package_owner):
    assert package_index.call().getOwner(registered_package) == package_owner

    chain.wait.for_receipt(package_index.transact().register(registered_package))

    assert package_index.call().getOwner(registered_package) == package_owner


def test_cannot_register_version_0(chain,
                                   package_index,
                                   registered_package,
                                   package_owner):
    assert package_index.call().numReleases(registered_package) == 0

    chain.wait.for_receipt(package_index.transact({
        'from': package_owner,
    }).release(registered_package, 0, 0, 0, 'ipfs://not-a-uri'))

    assert package_index.call().numReleases(registered_package) == 0


def test_latest_version_tracking(chain, package_index):
    chain.wait.for_receipt(package_index.transact().register('test'))
    chain.wait.for_receipt(package_index.transact().release('test', 1, 0, 0, ''))

    assert package_index.call().latestVersion('test') == [1, 0, 0, '']

    chain.wait.for_receipt(package_index.transact().release('test', 1, 1, 0, ''))

    assert package_index.call().latestVersion('test') == [1, 1, 0, '']

    chain.wait.for_receipt(package_index.transact().release('test', 1, 0, 1, ''))

    assert package_index.call().latestVersion('test') == [1, 1, 0, '']

    chain.wait.for_receipt(package_index.transact().release('test', 2, 0, 0, ''))

    assert package_index.call().latestVersion('test') == [2, 0, 0, '']


def test_querying_package_information(chain, web3, package_index):
    chain.wait.for_receipt(package_index.transact().register('test'))
    chain.wait.for_receipt(package_index.transact().release('test', 1, 0, 0, 'ipfs://uri-a'))
    chain.wait.for_receipt(package_index.transact().release('test', 2, 0, 0, 'ipfs://uri-b'))
    chain.wait.for_receipt(package_index.transact().release('test', 3, 0, 0, 'ipfs://uri-c'))

    assert package_index.call().getOwner('test') == web3.eth.coinbase

    assert package_index.call().numReleases('test') == 3
    assert package_index.call().getRelease('test', 0) == [1, 0, 0, 'ipfs://uri-a']
    assert package_index.call().getRelease('test', 1) == [2, 0, 0, 'ipfs://uri-b']
    assert package_index.call().getRelease('test', 2) == [3, 0, 0, 'ipfs://uri-c']
