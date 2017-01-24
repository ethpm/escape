import pytest

from ethereum.tester import TransactionFailed


def test_package_index_transferring_ownership(chain, web3, package_index):
    assert package_index.call().packageExists('test-a') is False

    owner = web3.eth.accounts[1]
    new_owner = web3.eth.accounts[2]

    chain.wait.for_receipt(package_index.transact({
        'from': owner,
    }).release(
        'test-a', 1, 2, 3, '', '', 'ipfs://some-ipfs-uri',
    ))

    assert package_index.call().getPackageData('test-a')[0] == owner

    chain.wait.for_receipt(package_index.transact({
        'from': owner,
    }).transferPackageOwner(
        'test-a', new_owner,
    ))

    assert package_index.call().getPackageData('test-a')[0] == new_owner


def test_cannot_transfer_package_owned_by_null_address(chain, web3, package_index):
    assert package_index.call().packageExists('test-a') is False

    new_owner = web3.eth.accounts[2]

    with pytest.raises(TransactionFailed):
        package_index.transact().transferPackageOwner(
            'test-a', new_owner,
        )

    assert package_index.call().packageExists('test-a') is False


def test_cannot_transfer_package_not_owned_by_sender(chain, web3, package_index):
    assert package_index.call().packageExists('test-a') is False

    not_owner = web3.eth.accounts[0]
    owner = web3.eth.accounts[1]
    new_owner = web3.eth.accounts[2]

    chain.wait.for_receipt(package_index.transact({
        'from': owner,
    }).release(
        'test-a', 1, 2, 3, '', '', 'ipfs://some-ipfs-uri',
    ))

    assert package_index.call().getPackageData('test-a')[0] == owner

    chain.wait.for_receipt(package_index.transact({
        'from': not_owner,
    }).transferPackageOwner(
        'test-a', new_owner,
    ))

    assert package_index.call().getPackageData('test-a')[0] == owner
