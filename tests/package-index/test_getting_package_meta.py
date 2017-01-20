NULL_ADDRESS = '0x0000000000000000000000000000000000000000'


def test_getting_number_of_releases(chain, package_index):
    chain.wait.for_receipt(package_index.transact().release(
        'test-a', 1, 2, 3, '', '', 'ipfs://some-ipfs-uri',
    ))
    chain.wait.for_receipt(package_index.transact().release(
        'test-b', 1, 2, 3, '', '', 'ipfs://some-other-ipfs-uri',
    ))
    chain.wait.for_receipt(package_index.transact().release(
        'test-a', 2, 3, 4, '', '', 'ipfs://another-ipfs-uri',
    ))

    assert package_index.call().getNumReleases('test-a') == 2
    assert package_index.call().getNumReleases('test-b') == 1


def test_checking_package_existence(chain, package_index):
    assert package_index.call().packageExists('test-a') is False

    chain.wait.for_receipt(package_index.transact().release(
        'test-a', 1, 2, 3, '', '', 'ipfs://some-ipfs-uri',
    ))

    assert package_index.call().packageExists('test-a') is True


def test_getting_package_owner(chain, web3, package_index):
    assert package_index.call().getPackageOwner('test-a') == NULL_ADDRESS

    owner = web3.eth.accounts[1]
    chain.wait.for_receipt(package_index.transact({
        'from': owner,
    }).release(
        'test-a', 1, 2, 3, '', '', 'ipfs://some-ipfs-uri',
    ))

    assert package_index.call().getPackageOwner('test-a') == owner


def test_checking_version_existence(chain, package_index):
    assert package_index.call().versionExists('test-a', 1, 2, 3, '', '') is False

    chain.wait.for_receipt(package_index.transact().release(
        'test-a', 1, 2, 3, '', '', 'ipfs://some-ipfs-uri',
    ))

    assert package_index.call().versionExists('test-a', 1, 2, 3, '', '') is True


def test_version_0_does_not_exist(chain, package_index):
    assert package_index.call().versionExists('test-a', 0, 0, 0, '', '') is False
    assert package_index.call().versionExists('', 0, 0, 0, '', '') is False
