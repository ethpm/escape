NULL_ADDRESS = '0x0000000000000000000000000000000000000000'


def test_creating_initial_release(chain, package_db, release_db, extract_event_logs):
    name_hash = package_db.call().hashName('test')
    version_hash = release_db.call().hashVersion(1, 2, 3, '', '')
    release_hash = release_db.call().hashRelease(name_hash, version_hash)
    chain.wait.for_receipt(release_db.transact().setVersion(1, 2, 3, '', ''))

    assert release_db.call().releaseExists(release_hash) is False

    txn_receipt = chain.wait.for_receipt(release_db.transact().setRelease(
        nameHash=name_hash,
        versionHash=version_hash,
        releaseLockfileURI='ipfs://some-ipfs-uri',
    ))

    assert release_db.call().releaseExists(release_hash) is True

    event_logs = extract_event_logs('ReleaseCreate', release_db, txn_receipt['transactionHash'])
    assert event_logs['args']['releaseHash'] == release_hash


def test_updating_release(chain, package_db, release_db, extract_event_logs):
    name_hash = package_db.call().hashName('test')
    version_hash = release_db.call().hashVersion(1, 2, 3, '', '')
    release_hash = release_db.call().hashRelease(name_hash, version_hash)
    chain.wait.for_receipt(release_db.transact().setVersion(1, 2, 3, '', ''))

    assert release_db.call().releaseExists(release_hash) is False

    chain.wait.for_receipt(release_db.transact().setRelease(
        nameHash=name_hash,
        versionHash=version_hash,
        releaseLockfileURI='ipfs://some-ipfs-uri',
    ))

    assert release_db.call().releaseExists(release_hash) is True
    assert release_db.call().getNumReleasesForNameHash(name_hash) == 1
    assert release_db.call().getReleaseLockfileURI(release_hash) == 'ipfs://some-ipfs-uri'

    txn_receipt = chain.wait.for_receipt(release_db.transact().setRelease(
        nameHash=name_hash,
        versionHash=version_hash,
        releaseLockfileURI='ipfs://some-updated-ipfs-uri',
    ))

    assert release_db.call().releaseExists(release_hash) is True
    assert release_db.call().getNumReleasesForNameHash(name_hash) == 1
    assert release_db.call().getReleaseLockfileURI(release_hash) == 'ipfs://some-updated-ipfs-uri'

    event_logs = extract_event_logs('ReleaseUpdate', release_db, txn_receipt['transactionHash'])
    assert event_logs['args']['releaseHash'] == release_hash


def test_deleting_a_release(chain, package_db, release_db, extract_event_logs):
    name_hash = package_db.call().hashName('test')
    version_hash = release_db.call().hashVersion(1, 2, 3, '', '')
    release_hash = release_db.call().hashRelease(name_hash, version_hash)
    chain.wait.for_receipt(release_db.transact().setVersion(1, 2, 3, '', ''))

    assert release_db.call().releaseExists(release_hash) is False

    chain.wait.for_receipt(release_db.transact().setRelease(
        nameHash=name_hash,
        versionHash=version_hash,
        releaseLockfileURI='ipfs://some-ipfs-uri',
    ))

    assert release_db.call().releaseExists(release_hash) is True
    assert release_db.call().getNumReleasesForNameHash(name_hash) == 1

    txn_receipt = chain.wait.for_receipt(release_db.transact().removeRelease(
        release_hash,
        'testing',
    ))

    assert release_db.call().releaseExists(release_hash) is False
    assert release_db.call().getNumReleasesForNameHash(name_hash) == 0

    event_logs = extract_event_logs('ReleaseDelete', release_db, txn_receipt['transactionHash'])
    assert event_logs['args']['releaseHash'] == release_hash
