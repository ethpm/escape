NULL_ADDRESS = '0x0000000000000000000000000000000000000000'


def test_setting_package_owner(chain, accounts, package_db, extract_event_logs):
    name_hash = package_db.call().hashName('test')
    owner = accounts[1]

    assert package_db.call().getPackage(name_hash)[0] == NULL_ADDRESS

    txn_receipt = chain.wait.for_receipt(package_db.transact().setPackageOwner(name_hash, owner))

    assert package_db.call().getPackage(name_hash)[0] == owner

    event_logs = extract_event_logs('PackageOwnerUpdate', package_db, txn_receipt['transactionHash'])
    assert event_logs['args']['nameHash'] == name_hash
    assert event_logs['args']['oldOwner'] == NULL_ADDRESS
    assert event_logs['args']['newOwner'] == owner


def test_setting_package_owner_to_null_address(chain, accounts, package_db, extract_event_logs):
    name_hash = package_db.call().hashName('test')
    owner = accounts[1]

    chain.wait.for_receipt(package_db.transact().setPackageOwner(name_hash, owner))

    assert package_db.call().getPackage(name_hash)[0] == owner

    txn_receipt = chain.wait.for_receipt(package_db.transact().setPackageOwner(
        name_hash,
        NULL_ADDRESS,
    ))

    assert package_db.call().getPackage(name_hash)[0] == NULL_ADDRESS

    event_logs = extract_event_logs('PackageOwnerUpdate', package_db, txn_receipt['transactionHash'])
    assert event_logs['args']['nameHash'] == name_hash
    assert event_logs['args']['oldOwner'] == owner
    assert event_logs['args']['newOwner'] == NULL_ADDRESS


def test_deleting_a_package(chain, accounts, package_db, extract_event_logs):
    name_hash = package_db.call().hashName('test')
    release_hash = package_db.call().hashRelease('test', 1, 2, 3, '', '')
    owner = accounts[1]

    chain.wait.for_receipt(package_db.transact().setPackageOwner(name_hash, owner))
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
    assert package_db.call().getPackage(name_hash)[0] == owner
    assert package_db.call().getPackage(name_hash)[1] == 1

    chain.wait.for_receipt(package_db.transact().removeRelease(release_hash, 'testing'))

    assert package_db.call().packageExists(name_hash) is True
    assert package_db.call().getPackage(name_hash)[1] == 0

    txn_receipt = chain.wait.for_receipt(package_db.transact().removePackage(
        name_hash,
        'testing',
    ))

    assert package_db.call().packageExists(name_hash) is False
    assert package_db.call().getPackage(name_hash)[0] == NULL_ADDRESS

    event_logs = extract_event_logs('PackageDelete', package_db, txn_receipt['transactionHash'])
    assert event_logs['args']['nameHash'] == name_hash
    assert event_logs['args']['reason'] == 'testing'


def test_cannot_delete_package_with_existing_releases(chain, accounts, package_db, extract_event_logs):
    name_hash = package_db.call().hashName('test')
    owner = accounts[1]

    chain.wait.for_receipt(package_db.transact().setPackageOwner(name_hash, owner))
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
    assert package_db.call().getPackage(name_hash)[0] == owner
    assert package_db.call().getPackage(name_hash)[1] == 1

    txn_receipt = chain.wait.for_receipt(package_db.transact().removePackage(name_hash, 'testing'))

    assert package_db.call().packageExists(name_hash) is True
    assert package_db.call().getPackage(name_hash)[0] == owner
    assert package_db.call().getPackage(name_hash)[1] == 1

    assert not txn_receipt['logs']
