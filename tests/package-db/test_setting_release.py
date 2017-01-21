NULL_ADDRESS = '0x0000000000000000000000000000000000000000'


def test_creating_initial_release(chain, package_db):
    name_hash = package_db.call().hashName('test')

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


def test_updating_release(chain, package_db):
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

    chain.wait.for_receipt(package_db.transact().setRelease(
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
