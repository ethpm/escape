import pytest


NULL_ADDRESS = '0x0000000000000000000000000000000000000000'


@pytest.fixture()
def empty_package(chain, package_db):
    name_hash = package_db.call().hashName('test')
    assert package_db.call().packageExists(name_hash) is False

    txn_receipt = chain.wait.for_receipt(package_db.transact().setPackage('test'))

    assert package_db.call().packageExists(name_hash) is True
    assert package_db.call().getPackageData(name_hash)[0] == NULL_ADDRESS
    return name_hash


def test_newly_created_package_empty_package(chain, web3, package_db, extract_event_logs):
    name_hash = package_db.call().hashName('test')
    assert package_db.call().packageExists(name_hash) is False

    txn_receipt = chain.wait.for_receipt(package_db.transact().setPackage('test'))
    timestamp = web3.eth.getBlock(txn_receipt['blockHash'])['timestamp']

    assert package_db.call().packageExists(name_hash) is True
    assert package_db.call().getPackageData(name_hash) == [NULL_ADDRESS, timestamp, timestamp]

    event_logs = extract_event_logs('PackageCreate', package_db, txn_receipt['transactionHash'])
    assert event_logs['args']['nameHash'] == name_hash


def test_setting_package_owner(chain, accounts, package_db, extract_event_logs, empty_package):
    name_hash = empty_package
    owner = accounts[1]

    assert package_db.call().getPackageData(name_hash)[0] == NULL_ADDRESS

    txn_receipt = chain.wait.for_receipt(package_db.transact().setPackageOwner(name_hash, owner))

    assert package_db.call().getPackageData(name_hash)[0] == owner

    event_logs = extract_event_logs('PackageOwnerUpdate', package_db, txn_receipt['transactionHash'])
    assert event_logs['args']['nameHash'] == name_hash
    assert event_logs['args']['oldOwner'] == NULL_ADDRESS
    assert event_logs['args']['newOwner'] == owner


def test_setting_package_owner_to_null_address(chain,
                                               accounts,
                                               package_db,
                                               extract_event_logs,
                                               empty_package):
    name_hash = empty_package
    owner = accounts[1]

    chain.wait.for_receipt(package_db.transact().setPackageOwner(name_hash, owner))

    assert package_db.call().getPackageData(name_hash)[0] == owner

    txn_receipt = chain.wait.for_receipt(package_db.transact().setPackageOwner(
        name_hash,
        NULL_ADDRESS,
    ))

    assert package_db.call().getPackageData(name_hash)[0] == NULL_ADDRESS

    event_logs = extract_event_logs('PackageOwnerUpdate', package_db, txn_receipt['transactionHash'])
    assert event_logs['args']['nameHash'] == name_hash
    assert event_logs['args']['oldOwner'] == owner
    assert event_logs['args']['newOwner'] == NULL_ADDRESS


def test_deleting_packages(chain,
                           accounts,
                           package_db,
                           extract_event_logs,
                           empty_package):
    name_hash = empty_package
    owner = accounts[1]

    assert package_db.call().packageExists(name_hash) is True

    txn_receipt = chain.wait.for_receipt(package_db.transact().removePackage(
        name_hash,
        'testing',
    ))

    assert package_db.call().packageExists(name_hash) is False

    event_logs = extract_event_logs('PackageDelete', package_db, txn_receipt['transactionHash'])
    assert event_logs['args']['nameHash'] == name_hash
    assert event_logs['args']['reason'] == 'testing'
