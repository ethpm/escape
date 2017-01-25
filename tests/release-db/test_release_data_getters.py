NULL_ADDRESS = '0x0000000000000000000000000000000000000000'


def test_creating_initial_release(chain,
                                  web3,
                                  accounts,
                                  package_db,
                                  release_db,
                                  extract_event_logs):
    name_hash = package_db.call().hashName('test')
    version_hash = release_db.call().hashVersion(1, 2, 3, 'beta.1', 'build.abcd1234')
    release_hash = release_db.call().hashRelease(name_hash, version_hash)

    owner = accounts[1]

    chain.wait.for_receipt(release_db.transact().setVersion(1, 2, 3, 'beta.1', 'build.abcd1234'))

    assert release_db.call().releaseExists(release_hash) is False

    txn_receipt = chain.wait.for_receipt(release_db.transact().setRelease(
        nameHash=name_hash,
        versionHash=version_hash,
        releaseLockfileURI='ipfs://some-ipfs-uri',
    ))

    timestamp = web3.eth.getBlock(txn_receipt['blockHash'])['timestamp']

    assert release_db.call().releaseExists(release_hash) is True
    assert release_db.call().getReleaseData(release_hash)[0] == name_hash
    assert release_db.call().getReleaseData(release_hash)[1] == version_hash
    assert release_db.call().getReleaseData(release_hash)[2] == timestamp
    assert release_db.call().getReleaseData(release_hash)[3] == timestamp
    assert release_db.call().getMajorMinorPatch(version_hash) == [1, 2, 3]
    assert release_db.call().getPreRelease(release_hash) == 'beta.1'
    assert release_db.call().getBuild(release_hash) == 'build.abcd1234'
    assert release_db.call().getReleaseLockfileURI(release_hash) == 'ipfs://some-ipfs-uri'
