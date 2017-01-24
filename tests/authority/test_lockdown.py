import pytest

from ethereum.tester import TransactionFailed


def test_locking_down_package_index_contract(chain,
                                             accounts,
                                             package_index,
                                             whitelist_call):
    # check we are not locked down
    chain.wait.for_receipt(package_index.transact().release(
        'test-1', 1, 0, 0, '', '', 'ipfs://an-ipfs-uri',
    ))

    whitelist_call(
        package_index.address,
        "release(string,uint32,uint32,uint32,string,string,string)",
        False,
    )

    with pytest.raises(TransactionFailed):
        chain.wait.for_receipt(package_index.transact().release(
            'test-2', 1, 0, 0, '', '', 'ipfs://an-ipfs-uri',
        ))

    chain.wait.for_receipt(package_index.transact().transferPackageOwner(
        'test-1', accounts[2],
    ))
    assert package_index.call().getPackageData('test-1')[0] == accounts[2]

    whitelist_call(
        package_index.address,
        "transferPackageOwner(string,address)",
        False,
    )

    with pytest.raises(TransactionFailed):
        chain.wait.for_receipt(package_index.transact().transferPackageOwner(
            'test-1', accounts[3],
        ))

    with pytest.raises(TransactionFailed):
        chain.wait.for_receipt(package_index.transact({
            'from': accounts[2],
        }).transferPackageOwner(
            'test-1', accounts[3],
        ))
