NULL_ADDRESS = '0x0000000000000000000000000000000000000000'


def test_creating_initial_release(chain, package_db, extract_event_logs):
    name_hash = package_db.call().hashName('test')
    release_hash = package_db.call().hashRelease('test', 1, 2, 3, '', '')

    assert package_db.call().packageExists(name_hash) is False
    assert package_db.call().getPackage(name_hash)[0] == NULL_ADDRESS
    assert package_db.call().getPackage(name_hash)[1] == 0

    txn_receipt = chain.wait.for_receipt(package_db.transact().setRelease(
        name='test',
        major=1,
        minor=2,
        patch=3,
        preRelease='',
        build='',
        releaseLockFileURI='ipfs://some-ipfs-uri',
    ))

    assert package_db.call().packageExists(name_hash) is True
    assert package_db.call().getPackage(name_hash)[0] == NULL_ADDRESS
    assert package_db.call().getPackage(name_hash)[1] == 1

    event_logs = extract_event_logs('ReleaseCreate', package_db, txn_receipt['transactionHash'])
    assert event_logs['args']['releaseHash'] == release_hash


def test_updating_release(chain, package_db, extract_event_logs):
    name_hash = package_db.call().hashName('test')
    release_hash = package_db.call().hashRelease('test', 1, 2, 3, '', '')

    assert package_db.call().packageExists(name_hash) is False
    assert package_db.call().getPackage(name_hash)[0] == NULL_ADDRESS
    assert package_db.call().getPackage(name_hash)[1] == 0

    chain.wait.for_receipt(package_db.transact().setRelease(
        name='test',
        major=1,
        minor=2,
        patch=3,
        preRelease='',
        build='',
        releaseLockFileURI='ipfs://some-ipfs-uri',
    ))

    assert package_db.call().packageExists(name_hash) is True
    assert package_db.call().getPackage(name_hash)[0] == NULL_ADDRESS
    assert package_db.call().getPackage(name_hash)[1] == 1

    assert package_db.call().getReleaseLockileURI(release_hash) == 'ipfs://some-ipfs-uri'

    txn_receipt = chain.wait.for_receipt(package_db.transact().setRelease(
        name='test',
        major=1,
        minor=2,
        patch=3,
        preRelease='',
        build='',
        releaseLockFileURI='ipfs://some-updated-ipfs-uri',
    ))

    assert package_db.call().packageExists(name_hash) is True
    assert package_db.call().getPackage(name_hash)[0] == NULL_ADDRESS
    assert package_db.call().getPackage(name_hash)[1] == 1

    assert package_db.call().getReleaseLockileURI(release_hash) == 'ipfs://some-updated-ipfs-uri'

    event_logs = extract_event_logs('ReleaseUpdate', package_db, txn_receipt['transactionHash'])
    assert event_logs['args']['releaseHash'] == release_hash


def test_deleting_a_release(chain, package_db, extract_event_logs):
    name_hash = package_db.call().hashName('test')
    release_hash = package_db.call().hashRelease('test', 1, 2, 3, '', '')

    assert package_db.call().packageExists(name_hash) is False
    assert package_db.call().releaseExists(release_hash) is False
    assert package_db.call().getPackage(name_hash)[0] == NULL_ADDRESS
    assert package_db.call().getPackage(name_hash)[1] == 0

    chain.wait.for_receipt(package_db.transact().setRelease(
        name='test',
        major=1,
        minor=2,
        patch=3,
        preRelease='',
        build='',
        releaseLockFileURI='ipfs://some-ipfs-uri',
    ))

    assert package_db.call().packageExists(name_hash) is True
    assert package_db.call().releaseExists(release_hash) is True
    assert package_db.call().getPackage(name_hash)[0] == NULL_ADDRESS
    assert package_db.call().getPackage(name_hash)[1] == 1

    txn_receipt = chain.wait.for_receipt(package_db.transact().removeRelease(
        release_hash,
        'testing',
    ))

    assert package_db.call().packageExists(name_hash) is True
    assert package_db.call().releaseExists(release_hash) is False
    assert package_db.call().getPackage(name_hash)[0] == NULL_ADDRESS
    assert package_db.call().getPackage(name_hash)[1] == 0

    event_logs = extract_event_logs('ReleaseDelete', package_db, txn_receipt['transactionHash'])
    assert event_logs['args']['releaseHash'] == release_hash
