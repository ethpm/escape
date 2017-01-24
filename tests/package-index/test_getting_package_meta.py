NULL_ADDRESS = '0x0000000000000000000000000000000000000000'


def test_getting_number_package_data(chain, web3, accounts, package_index):
    receipt_a = chain.wait.for_receipt(package_index.transact({
        'from': accounts[1],
    }).release(
        'test-a', 1, 2, 3, '', '', 'ipfs://some-ipfs-uri',
    ))
    assert receipt_a['gasUsed'] < 3000000
    receipt_b = chain.wait.for_receipt(package_index.transact({
        'from': accounts[2],
    }).release(
        'test-b', 1, 2, 3, '', '', 'ipfs://some-other-ipfs-uri',
    ))
    receipt_c = chain.wait.for_receipt(package_index.transact({
        'from': accounts[1],
    }).release(
        'test-a', 2, 3, 4, '', '', 'ipfs://another-ipfs-uri',
    ))

    assert package_index.call().getNumPackages() == 2

    test_a_created_at = web3.eth.getBlock(receipt_a['blockHash'])['timestamp']
    test_a_updated_at = web3.eth.getBlock(receipt_c['blockHash'])['timestamp']

    expected_package_a_data = [accounts[1], test_a_created_at, 2, test_a_updated_at]
    assert package_index.call().getPackageData('test-a') == expected_package_a_data

    test_b_created_at = test_b_updated_at = web3.eth.getBlock(
        receipt_b['blockHash'],
    )['timestamp']

    expected_package_b_data = [accounts[2], test_b_created_at, 1, test_b_updated_at]
    assert package_index.call().getPackageData('test-b') == expected_package_b_data


def test_checking_package_existence(chain, package_index):
    assert package_index.call().packageExists('test-a') is False

    chain.wait.for_receipt(package_index.transact().release(
        'test-a', 1, 2, 3, '', '', 'ipfs://some-ipfs-uri',
    ))

    assert package_index.call().packageExists('test-a') is True


def test_checking_release_existence(chain, package_index):
    assert package_index.call().releaseExists('test-a', 1, 2, 3, '', '') is False

    chain.wait.for_receipt(package_index.transact().release(
        'test-a', 1, 2, 3, '', '', 'ipfs://some-ipfs-uri',
    ))

    assert package_index.call().releaseExists('test-a', 1, 2, 3, '', '') is True


def test_release_0_does_not_exist(chain, package_index):
    assert package_index.call().releaseExists('test-a', 0, 0, 0, '', '') is False
    assert package_index.call().releaseExists('', 0, 0, 0, '', '') is False
