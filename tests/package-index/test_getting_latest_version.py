def test_getting_latest_version(chain, package_db, package_index):
    chain.wait.for_receipt(package_index.transact().release(
        'test', 1, 0, 0, '', '', 'ipfs://some-ipfs-uri-a',
    ))

    assert package_index.call().getNumReleases('test') == 1
    assert package_index.call().getLatestVersion('test') == [1, 0, 0, '', '', 'ipfs://some-ipfs-uri-a']

    chain.wait.for_receipt(package_index.transact().release(
        'test', 1, 1, 0, '', '', 'ipfs://some-ipfs-uri-b',
    ))

    assert package_index.call().getNumReleases('test') == 2
    assert package_index.call().getLatestVersion('test') == [1, 1, 0, '', '', 'ipfs://some-ipfs-uri-b']

    chain.wait.for_receipt(package_index.transact().release(
        'test', 1, 0, 1, '', '', 'ipfs://some-ipfs-uri-c',
    ))

    assert package_index.call().getNumReleases('test') == 3
    assert package_index.call().getLatestVersion('test') == [1, 1, 0, '', '', 'ipfs://some-ipfs-uri-b']

    chain.wait.for_receipt(package_index.transact().release(
        'test', 2, 0, 0, '', '', 'ipfs://some-ipfs-uri-d',
    ))

    assert package_index.call().getNumReleases('test') == 4
    assert package_index.call().getLatestVersion('test') == [2, 0, 0, '', '', 'ipfs://some-ipfs-uri-d']
