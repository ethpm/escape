def test_latest_version_tracking(chain, package_db, package_index):
    chain.wait.for_receipt(package_index.transact().release(
        'test', 1, 0, 0, '', '', ''
    ))

    assert package_index.call().getNumReleases('test') == 1
    assert package_index.call().getLatestVersion('test') == [1, 0, 0, '', '', '']

    chain.wait.for_receipt(package_index.transact().release(
        'test', 1, 1, 0, '', '', ''
    ))

    assert package_index.call().getNumReleases('test') == 2
    assert package_index.call().getLatestVersion('test') == [1, 1, 0, '', '', '']

    chain.wait.for_receipt(package_index.transact().release(
        'test', 1, 0, 1, '', '', ''
    ))

    assert package_index.call().getNumReleases('test') == 3
    assert package_index.call().getLatestVersion('test') == [1, 1, 0, '', '', '']

    chain.wait.for_receipt(package_index.transact().release(
        'test', 2, 0, 0, '', '', ''
    ))

    assert package_index.call().getNumReleases('test') == 4
    assert package_index.call().getLatestVersion('test') == [2, 0, 0, '', '', '']
