def test_retrieving_release_by_index(chain, web3, package_index):
    release_info_a = ['test', 1, 2, 3, 'a', 'b', 'ipfs://some-ipfs-uri']
    release_info_b = ['test', 2, 3, 4, 'c', 'd', 'ipfs://some-other-ipfs-uri']

    chain.wait.for_receipt(package_index.transact().release(*release_info_a))
    chain.wait.for_receipt(package_index.transact().release(*release_info_b))

    assert package_index.call().getRelease('test', 0) == release_info_a[1:]
    assert package_index.call().getRelease('test', 1) == release_info_b[1:]


def test_retrieving_release_by_release_hash(chain, web3, package_index, package_db):
    release_info_a = ['test', 1, 2, 3, 'a', 'b', 'ipfs://some-ipfs-uri']
    release_info_b = ['test', 2, 3, 4, 'c', 'd', 'ipfs://some-other-ipfs-uri']

    release_hash_a = package_db.call().hashRelease(*release_info_a[:-1])
    release_hash_b = package_db.call().hashRelease(*release_info_b[:-1])

    chain.wait.for_receipt(package_index.transact().release(*release_info_a))
    chain.wait.for_receipt(package_index.transact().release(*release_info_b))

    assert package_index.call().getRelease(release_hash_a) == release_info_a[1:]
    assert package_index.call().getRelease(release_hash_b) == release_info_b[1:]


def test_retrieving_list_of_release_hashes(chain, web3, package_index, package_db):
    release_info_a = ['test', 1, 2, 3, 'a', 'b', 'ipfs://some-ipfs-uri']
    release_info_b = ['test', 2, 3, 4, 'c', 'd', 'ipfs://some-other-ipfs-uri']
    release_info_c = ['test', 3, 4, 5, 'e', 'f', 'ipfs://yet-another-ipfs-uri']

    release_hash_a = package_db.call().hashRelease(*release_info_a[:-1])
    release_hash_b = package_db.call().hashRelease(*release_info_b[:-1])
    release_hash_c = package_db.call().hashRelease(*release_info_c[:-1])

    chain.wait.for_receipt(package_index.transact().release(*release_info_a))
    chain.wait.for_receipt(package_index.transact().release(*release_info_b))
    chain.wait.for_receipt(package_index.transact().release(*release_info_c))

    all_release_hashes = package_index.call().getAllReleaseHashes('test')
    assert all_release_hashes == [release_hash_a, release_hash_b, release_hash_c]
