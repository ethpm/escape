NULL_ADDRESS = '0x0000000000000000000000000000000000000000'


def test_package_index_transferring_ownership(chain, web3, package_index):
    assert package_index.call().getPackageOwner('test-a') == NULL_ADDRESS

    owner = web3.eth.accounts[1]
    new_owner = web3.eth.accounts[2]

    chain.wait.for_receipt(package_index.transact({
        'from': owner,
    }).release(
        'test-a', 1, 2, 3, '', '', 'ipfs://some-ipfs-uri',
    ))

    assert package_index.call().getPackageOwner('test-a') == owner

    chain.wait.for_receipt(package_index.transact({
        'from': owner,
    }).transferPackageOwner(
        'test-a', new_owner,
    ))

    assert package_index.call().getPackageOwner('test-a') == new_owner


def test_cannot_transfer_package_owned_by_null_address(chain, web3, package_index):
    assert package_index.call().getPackageOwner('test-a') == NULL_ADDRESS

    new_owner = web3.eth.accounts[2]

    chain.wait.for_receipt(package_index.transact().transferPackageOwner(
        'test-a', new_owner,
    ))

    assert package_index.call().getPackageOwner('test-a') == NULL_ADDRESS


def test_cannot_transfer_package_not_owned_by_sender(chain, web3, package_index):
    assert package_index.call().getPackageOwner('test-a') == NULL_ADDRESS

    not_owner = web3.eth.accounts[0]
    owner = web3.eth.accounts[1]
    new_owner = web3.eth.accounts[2]

    chain.wait.for_receipt(package_index.transact({
        'from': owner,
    }).release(
        'test-a', 1, 2, 3, '', '', 'ipfs://some-ipfs-uri',
    ))

    assert package_index.call().getPackageOwner('test-a') == owner

    chain.wait.for_receipt(package_index.transact({
        'from': not_owner,
    }).transferPackageOwner(
        'test-a', new_owner,
    ))

    assert package_index.call().getPackageOwner('test-a') == owner
