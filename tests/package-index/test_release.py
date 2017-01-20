NULL_ADDRESS = '0x0000000000000000000000000000000000000000'


def test_registering_package(chain, web3, package_index):
    assert package_index.call().packageExists('test') is False
    assert package_index.call().getPackageOwner('test') == NULL_ADDRESS

    chain.wait.for_receipt(package_index.transact().release(
        name='test-package',
        major=1,
        minor=2,
        patch=3,
        preRelease='',
        build='',
        releaseLockFileURI='ipfs://not-a-real-uri',
    ))

    assert package_index.call().packageExists('test') is True
    assert package_index.call().getPackageOwner('test-package') == web3.eth.coinbase


def test_cannot_register_existing_package(chain,
                                          package_index,
                                          test_package,
                                          package_owner):
    assert package_index.call().packageExists(test_package) is True
    assert package_index.call().getPackageOwner(test_package) == package_owner
    assert package_index.call().getNumReleases(test_package) == 1

    chain.wait.for_receipt(package_index.transact().release(
        name=test_package,
        major=2,
        minor=0,
        patch=0,
        preRelease='',
        build='',
        releaseLockFileURI='ipfs://not-a-real-uri',
    ))

    assert package_index.call().packageExists(test_package) is True
    assert package_index.call().getPackageOwner(test_package) == package_owner
    assert package_index.call().getNumReleases(test_package) == 1


def test_cannot_register_version_0(chain,
                                   package_index,
                                   test_package,
                                   package_owner):
    assert package_index.call().getNumReleases(test_package) == 1

    chain.wait.for_receipt(package_index.transact({
        'from': package_owner,
    }).release(test_package, 0, 0, 0, '', '', 'ipfs://not-a-uri'))

    assert package_index.call().getNumReleases(test_package) == 1




def test_querying_package_information(chain, web3, package_index):
    chain.wait.for_receipt(package_index.transact().release('test', 1, 2, 3, 'a', 'b', 'ipfs://uri-a'))
    chain.wait.for_receipt(package_index.transact().release('test', 2, 3, 4, 'c', 'd', 'ipfs://uri-b'))
    chain.wait.for_receipt(package_index.transact().release('test', 3, 4, 5, 'e', 'f', 'ipfs://uri-c'))

    assert package_index.call().getPackageOwner('test') == web3.eth.coinbase

    assert package_index.call().getNumReleases('test') == 3
    assert package_index.call().getRelease('test', 0) == [1, 2, 3, 'a', 'b', 'ipfs://uri-a']
    assert package_index.call().getRelease('test', 1) == [2, 3, 4, 'c', 'd', 'ipfs://uri-b']
    assert package_index.call().getRelease('test', 2) == [3, 4, 5, 'e', 'f', 'ipfs://uri-c']


def test_gas_usage_for_large_deploy_data(chain, package_index):
    package_name = 'a' * 214
    receipt_a = chain.wait.for_receipt(package_index.transact().release(
        name=package_name,
        major=1,
        minor=2,
        patch=3,
        preRelease='alpha.1.beta.2.delta.3.gamma.4',
        build='4f18c7a18a7de27cf3fbeff31feccdce570d410b',
        releaseLockFileURI='ipfs://QmZrAGa3YwWPkop11vDZjfSmQGWGzjXkh6J3ns7AbENu73',
    ))

    assert package_index.call().getNumReleases(package_name) == 1
    assert receipt_a['gasUsed'] < 2000000

    receipt_b = chain.wait.for_receipt(package_index.transact().release(
        name=package_name,
        major=1,
        minor=2,
        patch=3,
        preRelease='alpha.1.beta.2.delta.3.gamma.4.xray.5',
        build='b9953be8e1bdbfd70ed998a5111f0c3ed0cebf46',
        releaseLockFileURI='ipfs://QmZrAGa3YwWPkop11vDZjfSmQGWGzjXkh6J3ns7AbENu73',
    ))

    assert package_index.call().getNumReleases(package_name) == 2
    assert receipt_b['gasUsed'] < 2000000
