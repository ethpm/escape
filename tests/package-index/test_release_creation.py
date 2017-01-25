NULL_ADDRESS = '0x0000000000000000000000000000000000000000'


def test_creating_initial_release(chain, web3, package_index):
    assert package_index.call().packageExists('test') is False

    chain.wait.for_receipt(package_index.transact().release(
        name='test',
        major=1,
        minor=2,
        patch=3,
        preRelease='',
        build='',
        releaseLockfileURI='ipfs://some-ipfs-uri',
    ))

    assert package_index.call().packageExists('test') is True
    assert package_index.call().getPackageData('test')[0] == web3.eth.coinbase


def test_creating_subsequent_releases(chain, web3, package_index):
    assert package_index.call().packageExists('test') is False

    chain.wait.for_receipt(package_index.transact().release(
        'test', 1, 2, 3, '', '', 'ipfs://some-ipfs-uri',
    ))

    assert package_index.call().packageExists('test') is True
    assert package_index.call().getPackageData('test')[0] == web3.eth.coinbase
    assert package_index.call().getPackageData('test')[2] == 1

    chain.wait.for_receipt(package_index.transact().release(
        'test', 2, 3, 4, '', '', 'ipfs://some-other-ipfs-uri',
    ))

    assert package_index.call().packageExists('test') is True
    assert package_index.call().getPackageData('test')[0] == web3.eth.coinbase
    assert package_index.call().getPackageData('test')[2] == 2


def test_only_owner_can_release_package(chain,
                                        web3,
                                        package_index,
                                        test_package,
                                        package_owner):
    assert package_index.call().packageExists(test_package) is True
    assert package_index.call().getPackageData(test_package)[0] == package_owner
    assert package_index.call().getPackageData(test_package)[2] == 1

    not_owner = web3.eth.accounts[0]
    assert not_owner != package_owner

    chain.wait.for_receipt(package_index.transact({
        'from': not_owner,
    }).release(
        name=test_package,
        major=2,
        minor=0,
        patch=0,
        preRelease='',
        build='',
        releaseLockfileURI='ipfs://some-ipfs-uri',
    ))

    assert package_index.call().packageExists(test_package) is True
    assert package_index.call().getPackageData(test_package)[0] == package_owner
    assert package_index.call().getPackageData(test_package)[2] == 1
