import pytest
import functools


def _assert_release(web3,
                    package_index,
                    package_db,
                    release_db,
                    name,
                    major,
                    minor,
                    patch,
                    pre_release,
                    build,
                    lockfile_uri,
                    release_receipt,
                    release_data):
    timestamp = web3.eth.getBlock(release_receipt['blockHash'])['timestamp']
    name_hash = package_db.call().hashName(name)
    version_hash = release_db.call().hashVersion(major, minor, patch, pre_release, build)
    release_hash = release_db.call().hashRelease(name_hash, version_hash)

    assert package_index.call().releaseExists(name, major, minor, patch, pre_release, build)
    assert release_hash in package_index.call().getAllPackageReleaseHashes(name)
    assert release_data == [major, minor, patch, pre_release, build, lockfile_uri, timestamp, timestamp]


@pytest.fixture
def assert_release(web3, package_index, package_db, release_db):
    return functools.partial(_assert_release, web3, package_index, package_db, release_db)


def test_retrieving_release_by_index(chain, web3, package_index, package_db, release_db):
    name_hash = package_db.call().hashName('test')
    release_info_a = ['test', 1, 2, 3, 'a', 'b', 'ipfs://some-ipfs-uri']
    release_info_b = ['test', 2, 3, 4, 'c', 'd', 'ipfs://some-other-ipfs-uri']

    version_hash_a = release_db.call().hashVersion(*release_info_a[1:-1])
    version_hash_b = release_db.call().hashVersion(*release_info_b[1:-1])

    release_hash_a = release_db.call().hashRelease(name_hash, version_hash_a)
    release_hash_b = release_db.call().hashRelease(name_hash, version_hash_b)

    receipt_a = chain.wait.for_receipt(package_index.transact().release(*release_info_a))
    receipt_b = chain.wait.for_receipt(package_index.transact().release(*release_info_b))

    actual_release_hash_a = package_index.call().getReleaseHashForPackage('test', 0)
    actual_release_hash_b = package_index.call().getReleaseHashForPackage('test', 1)

    assert actual_release_hash_a == release_hash_a
    assert actual_release_hash_b == release_hash_b


def test_direct_retrieval_of_lockfile_uri(chain, web3, package_index, package_db, release_db):
    name_hash = package_db.call().hashName('test')
    release_info = ['test', 2, 3, 4, 'c', 'd', 'ipfs://some--ipfs-uri']

    version_hash = release_db.call().hashVersion(*release_info[1:-1])

    release_hash = release_db.call().hashRelease(name_hash, version_hash)

    receipt = chain.wait.for_receipt(package_index.transact().release(*release_info))

    lockfile_uri = package_index.call().getReleaseLockfileURI(*release_info[:-1])
    assert lockfile_uri == release_info[-1]


def test_retrieving_release_by_release_hash(chain,
                                            web3,
                                            package_index,
                                            package_db,
                                            release_db,
                                            assert_release):
    name_hash = package_db.call().hashName('test')
    release_info_a = ['test', 1, 2, 3, 'a', 'b', 'ipfs://some-ipfs-uri']
    release_info_b = ['test', 2, 3, 4, 'c', 'd', 'ipfs://some-other-ipfs-uri']

    version_hash_a = release_db.call().hashVersion(*release_info_a[1:-1])
    version_hash_b = release_db.call().hashVersion(*release_info_b[1:-1])

    release_hash_a = release_db.call().hashRelease(name_hash, version_hash_a)
    release_hash_b = release_db.call().hashRelease(name_hash, version_hash_b)

    receipt_a = chain.wait.for_receipt(package_index.transact().release(*release_info_a))
    receipt_b = chain.wait.for_receipt(package_index.transact().release(*release_info_b))

    release_data_a = package_index.call().getReleaseData(release_hash_a)
    release_data_b = package_index.call().getReleaseData(release_hash_b)

    assert_release(*release_info_a, release_receipt=receipt_a, release_data=release_data_a)
    assert_release(*release_info_b, release_receipt=receipt_b, release_data=release_data_b)


def test_retrieving_list_of_package_release_hashes(chain,
                                                   web3,
                                                   package_index,
                                                   package_db,
                                                   release_db):
    name_hash = package_db.call().hashName('test')

    release_info_a = ['test', 1, 2, 3, 'a', 'b', 'ipfs://some-ipfs-uri']
    release_info_b = ['test', 2, 3, 4, 'c', 'd', 'ipfs://some-other-ipfs-uri']
    release_info_c = ['test', 3, 4, 5, 'e', 'f', 'ipfs://yet-another-ipfs-uri']

    version_hash_a = release_db.call().hashVersion(*release_info_a[1:-1])
    version_hash_b = release_db.call().hashVersion(*release_info_b[1:-1])
    version_hash_c = release_db.call().hashVersion(*release_info_c[1:-1])

    release_hash_a = release_db.call().hashRelease(name_hash, version_hash_a)
    release_hash_b = release_db.call().hashRelease(name_hash, version_hash_b)
    release_hash_c = release_db.call().hashRelease(name_hash, version_hash_c)

    chain.wait.for_receipt(package_index.transact().release(*release_info_a))
    chain.wait.for_receipt(package_index.transact().release(*release_info_b))
    chain.wait.for_receipt(package_index.transact().release(*release_info_c))

    assert package_index.call().getPackageData('test')[2] == 3

    all_release_hashes = package_index.call().getAllPackageReleaseHashes('test')
    assert all_release_hashes == [release_hash_a, release_hash_b, release_hash_c]


def test_retrieving_all_release_hashes(chain, web3, package_index, package_db, release_db):
    name_hash_a = package_db.call().hashName('test-a')
    name_hash_b = package_db.call().hashName('test-b')
    name_hash_c = package_db.call().hashName('test-c')

    release_info_a = ['test-a', 1, 2, 3, 'a', 'b', 'ipfs://a']
    release_info_b = ['test-b', 2, 3, 4, 'c', 'd', 'ipfs://b']
    release_info_c = ['test-c', 3, 4, 5, 'e', 'f', 'ipfs://c']
    release_info_d = ['test-c', 3, 4, 6, 'e', 'f', 'ipfs://d']
    release_info_e = ['test-b', 2, 4, 5, 'c', 'd', 'ipfs://e']
    release_info_f = ['test-c', 3, 5, 5, 'e', 'f', 'ipfs://f']

    version_hash_a = release_db.call().hashVersion(*release_info_a[1:-1])
    version_hash_b = release_db.call().hashVersion(*release_info_b[1:-1])
    version_hash_c = release_db.call().hashVersion(*release_info_c[1:-1])
    version_hash_d = release_db.call().hashVersion(*release_info_d[1:-1])
    version_hash_e = release_db.call().hashVersion(*release_info_e[1:-1])
    version_hash_f = release_db.call().hashVersion(*release_info_f[1:-1])

    release_hash_a = release_db.call().hashRelease(name_hash_a, version_hash_a)
    release_hash_b = release_db.call().hashRelease(name_hash_b, version_hash_b)
    release_hash_c = release_db.call().hashRelease(name_hash_c, version_hash_c)
    release_hash_d = release_db.call().hashRelease(name_hash_c, version_hash_d)
    release_hash_e = release_db.call().hashRelease(name_hash_b, version_hash_e)
    release_hash_f = release_db.call().hashRelease(name_hash_c, version_hash_f)

    chain.wait.for_receipt(package_index.transact().release(*release_info_a))
    chain.wait.for_receipt(package_index.transact().release(*release_info_b))
    chain.wait.for_receipt(package_index.transact().release(*release_info_c))
    chain.wait.for_receipt(package_index.transact().release(*release_info_d))
    chain.wait.for_receipt(package_index.transact().release(*release_info_e))
    chain.wait.for_receipt(package_index.transact().release(*release_info_f))

    assert package_index.call().getPackageData('test-a')[2] == 1
    assert package_index.call().getPackageData('test-b')[2] == 2
    assert package_index.call().getPackageData('test-c')[2] == 3

    assert package_index.call().getNumReleases() == 6

    all_release_hashes = package_index.call().getAllReleaseHashes()
    expected_release_hashs = [
        release_hash_a,
        release_hash_b,
        release_hash_c,
        release_hash_d,
        release_hash_e,
        release_hash_f,
    ]
    assert all_release_hashes == expected_release_hashs
