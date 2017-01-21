NULL_ADDRESS = '0x0000000000000000000000000000000000000000'


def test_creating_initial_release(chain, accounts, package_db, extract_event_logs):
    name_hash = package_db.call().hashName('test')
    release_hash = package_db.call().hashRelease('test', 1, 2, 3, 'beta.1', 'build.abcd1234')
    version_hash = package_db.call().hashVersion(1, 2, 3, 'beta.1', 'build.abcd1234')
    owner = accounts[1]

    assert package_db.call().packageExists(name_hash) is False
    assert package_db.call().releaseExists(release_hash) is False
    assert package_db.call().getPackage(name_hash)[0] == NULL_ADDRESS
    assert package_db.call().getPackage(name_hash)[1] == 0

    chain.wait.for_receipt(package_db.transact().setPackageOwner(
        name_hash, owner,
    ))
    txn_receipt = chain.wait.for_receipt(package_db.transact().setRelease(
        name='test',
        major=1,
        minor=2,
        patch=3,
        preRelease='beta.1',
        build='build.abcd1234',
        releaseLockFileURI='ipfs://some-ipfs-uri',
    ))

    assert package_db.call().packageExists(name_hash) is True
    assert package_db.call().releaseExists(release_hash) is True
    assert package_db.call().getPackage(name_hash)[0] == owner
    assert package_db.call().getPackage(name_hash)[1] == 1
    assert package_db.call().getPackageName(name_hash) == 'test'
    assert package_db.call().getMajorMinorPatch(version_hash) == [1, 2, 3]
    assert package_db.call().getPreRelease(release_hash) == 'beta.1'
    assert package_db.call().getBuild(release_hash) == 'build.abcd1234'
    assert package_db.call().getReleaseLockileURI(release_hash) == 'ipfs://some-ipfs-uri'
