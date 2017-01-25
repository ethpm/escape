def test_package_version_tree_tracking(chain, package_db, release_db):
    name_hash = package_db.call().hashName('test')

    v100 = ['test', 1, 0, 0, '', '']
    v110 = ['test', 1, 1, 0, '', '']
    v101 = ['test', 1, 0, 1, '', '']
    v200 = ['test', 2, 0, 0, '', '']
    v123 = ['test', 1, 2, 3, '', '']
    v124a1bz = ['test', 1, 2, 4, 'alpha.1', 'build.z']
    v124a1ba = ['test', 1, 2, 4, 'alpha.1', 'build.a']
    v124a2ba = ['test', 1, 2, 4, 'alpha.2', 'build.a']
    v124a10ba = ['test', 1, 2, 4, 'alpha.10', 'build.a']
    v124b1ba = ['test', 1, 2, 4, 'beta.1', 'build.a']
    v124 = ['test', 1, 2, 4, '', '']

    versions = [
        v100,
        v110,
        v101,
        v200,
        v123,
        v124a1bz,
        v124a1ba,
        v124a2ba,
        v124a10ba,
        v124b1ba,
        v124,
    ]
    for version in versions:
        chain.wait.for_receipt(release_db.transact().setVersion(*version[1:]))

    v100vh = release_db.call().hashVersion(*v100[1:])
    v110vh = release_db.call().hashVersion(*v110[1:])
    v101vh = release_db.call().hashVersion(*v101[1:])
    v200vh = release_db.call().hashVersion(*v200[1:])
    v123vh = release_db.call().hashVersion(*v123[1:])
    v124a1bzvh = release_db.call().hashVersion(*v124a1bz[1:])
    v124a1bavh = release_db.call().hashVersion(*v124a1ba[1:])
    v124a2bavh = release_db.call().hashVersion(*v124a2ba[1:])
    v124a10bavh = release_db.call().hashVersion(*v124a10ba[1:])
    v124b1bavh = release_db.call().hashVersion(*v124b1ba[1:])
    v124vh = release_db.call().hashVersion(*v124[1:])

    v100h = release_db.call().hashRelease(name_hash, v100vh)
    v110h = release_db.call().hashRelease(name_hash, v110vh)
    v101h = release_db.call().hashRelease(name_hash, v101vh)
    v200h = release_db.call().hashRelease(name_hash, v200vh)
    v123h = release_db.call().hashRelease(name_hash, v123vh)
    v124a1bzh = release_db.call().hashRelease(name_hash, v124a1bzvh)
    v124a1bah = release_db.call().hashRelease(name_hash, v124a1bavh)
    v124a2bah = release_db.call().hashRelease(name_hash, v124a2bavh)
    v124a10bah = release_db.call().hashRelease(name_hash, v124a10bavh)
    v124b1bah = release_db.call().hashRelease(name_hash, v124b1bavh)
    v124h = release_db.call().hashRelease(name_hash, v124vh)

    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v100vh, releaseLockfileURI='ipfs://some-ipfs-uri-a'))

    assert release_db.call().getNumReleasesForNameHash(name_hash) == 1

    assert release_db.call().getLatestMajorTree(name_hash) == v100h
    assert release_db.call().getLatestMinorTree(name_hash, 1) == v100h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 0) == v100h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 0) == v100h

    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v110vh, releaseLockfileURI='ipfs://some-ipfs-uri-b'))

    assert release_db.call().getNumReleasesForNameHash(name_hash) == 2

    assert release_db.call().getLatestMajorTree(name_hash) == v110h
    assert release_db.call().getLatestMinorTree(name_hash, 1) == v110h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 0) == v100h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 1) == v110h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 0) == v100h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 1, 0) == v110h

    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v101vh, releaseLockfileURI='ipfs://some-ipfs-uri-c'))

    assert release_db.call().getNumReleasesForNameHash(name_hash) == 3

    assert release_db.call().getLatestMajorTree(name_hash) == v110h
    assert release_db.call().getLatestMinorTree(name_hash, 1) == v110h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 0) == v101h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 1) == v110h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 0) == v100h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 1) == v101h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 1, 0) == v110h

    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v200vh, releaseLockfileURI='ipfs://some-ipfs-uri-d'))

    assert release_db.call().getNumReleasesForNameHash(name_hash) == 4

    assert release_db.call().getLatestMajorTree(name_hash) == v200h
    assert release_db.call().getLatestMinorTree(name_hash, 1) == v110h
    assert release_db.call().getLatestMinorTree(name_hash, 2) == v200h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 0) == v101h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 1) == v110h
    assert release_db.call().getLatestPatchTree(name_hash, 2, 0) == v200h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 0) == v100h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 1) == v101h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 1, 0) == v110h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 2, 0, 0) == v200h

    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v123vh, releaseLockfileURI='ipfs://some-ipfs-uri-e'))

    assert release_db.call().getNumReleasesForNameHash(name_hash) == 5

    assert release_db.call().getLatestMajorTree(name_hash) == v200h
    assert release_db.call().getLatestMinorTree(name_hash, 1) == v123h
    assert release_db.call().getLatestMinorTree(name_hash, 2) == v200h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 0) == v101h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 1) == v110h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 2) == v123h
    assert release_db.call().getLatestPatchTree(name_hash, 2, 0) == v200h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 0) == v100h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 1) == v101h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 1, 0) == v110h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 2, 3) == v123h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 2, 0, 0) == v200h

    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v124a1bzvh, releaseLockfileURI='ipfs://some-ipfs-uri-f'))

    assert release_db.call().getNumReleasesForNameHash(name_hash) == 6

    assert release_db.call().getLatestMajorTree(name_hash) == v200h
    assert release_db.call().getLatestMinorTree(name_hash, 1) == v124a1bzh
    assert release_db.call().getLatestMinorTree(name_hash, 2) == v200h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 0) == v101h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 1) == v110h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 2) == v124a1bzh
    assert release_db.call().getLatestPatchTree(name_hash, 2, 0) == v200h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 0) == v100h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 1) == v101h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 1, 0) == v110h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 2, 3) == v123h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 2, 4) == v124a1bzh
    assert release_db.call().getLatestPreReleaseTree(name_hash, 2, 0, 0) == v200h

    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v124a1bavh, releaseLockfileURI='ipfs://some-ipfs-uri-g'))

    assert release_db.call().getNumReleasesForNameHash(name_hash) == 7

    assert release_db.call().getLatestMajorTree(name_hash) == v200h
    assert release_db.call().getLatestMinorTree(name_hash, 1) == v124a1bah
    assert release_db.call().getLatestMinorTree(name_hash, 2) == v200h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 0) == v101h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 1) == v110h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 2) == v124a1bah
    assert release_db.call().getLatestPatchTree(name_hash, 2, 0) == v200h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 0) == v100h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 1) == v101h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 1, 0) == v110h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 2, 3) == v123h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 2, 4) == v124a1bah
    assert release_db.call().getLatestPreReleaseTree(name_hash, 2, 0, 0) == v200h

    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v124a2bavh, releaseLockfileURI='ipfs://some-ipfs-uri-g'))

    assert release_db.call().getNumReleasesForNameHash(name_hash) == 8

    assert release_db.call().getLatestMajorTree(name_hash) == v200h
    assert release_db.call().getLatestMinorTree(name_hash, 1) == v124a2bah
    assert release_db.call().getLatestMinorTree(name_hash, 2) == v200h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 0) == v101h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 1) == v110h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 2) == v124a2bah
    assert release_db.call().getLatestPatchTree(name_hash, 2, 0) == v200h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 0) == v100h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 1) == v101h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 1, 0) == v110h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 2, 3) == v123h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 2, 4) == v124a2bah
    assert release_db.call().getLatestPreReleaseTree(name_hash, 2, 0, 0) == v200h

    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v124a10bavh, releaseLockfileURI='ipfs://some-ipfs-uri-h'))

    assert release_db.call().getNumReleasesForNameHash(name_hash) == 9

    assert release_db.call().getLatestMajorTree(name_hash) == v200h
    assert release_db.call().getLatestMinorTree(name_hash, 1) == v124a10bah
    assert release_db.call().getLatestMinorTree(name_hash, 2) == v200h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 0) == v101h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 1) == v110h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 2) == v124a10bah
    assert release_db.call().getLatestPatchTree(name_hash, 2, 0) == v200h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 0) == v100h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 1) == v101h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 1, 0) == v110h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 2, 3) == v123h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 2, 4) == v124a10bah
    assert release_db.call().getLatestPreReleaseTree(name_hash, 2, 0, 0) == v200h

    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v124b1bavh, releaseLockfileURI='ipfs://some-ipfs-uri-h'))

    assert release_db.call().getNumReleasesForNameHash(name_hash) == 10

    assert release_db.call().getLatestMajorTree(name_hash) == v200h
    assert release_db.call().getLatestMinorTree(name_hash, 1) == v124b1bah
    assert release_db.call().getLatestMinorTree(name_hash, 2) == v200h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 0) == v101h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 1) == v110h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 2) == v124b1bah
    assert release_db.call().getLatestPatchTree(name_hash, 2, 0) == v200h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 0) == v100h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 1) == v101h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 1, 0) == v110h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 2, 3) == v123h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 2, 4) == v124b1bah
    assert release_db.call().getLatestPreReleaseTree(name_hash, 2, 0, 0) == v200h

    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v124vh, releaseLockfileURI='ipfs://some-ipfs-uri-h'))

    assert release_db.call().getNumReleasesForNameHash(name_hash) == 11

    assert release_db.call().getLatestMajorTree(name_hash) == v200h
    assert release_db.call().getLatestMinorTree(name_hash, 1) == v124h
    assert release_db.call().getLatestMinorTree(name_hash, 2) == v200h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 0) == v101h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 1) == v110h
    assert release_db.call().getLatestPatchTree(name_hash, 1, 2) == v124h
    assert release_db.call().getLatestPatchTree(name_hash, 2, 0) == v200h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 0) == v100h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 1) == v101h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 1, 0) == v110h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 2, 3) == v123h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 2, 4) == v124h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 2, 0, 0) == v200h


def test_version_tree_is_updated_when_releases_are_removed(chain, package_db, release_db):
    name_hash = package_db.call().hashName('test')

    v100 = ['test', 1, 0, 0, '', '']
    v110b1 = ['test', 1, 1, 0, 'beta.1', '']
    v110 = ['test', 1, 1, 0, '', '']
    v101 = ['test', 1, 0, 1, '', '']
    v200 = ['test', 2, 0, 0, '', '']
    v123 = ['test', 1, 2, 3, '', '']
    v124a1bz = ['test', 1, 2, 4, 'alpha.1', 'build.z']
    v124a1ba = ['test', 1, 2, 4, 'alpha.1', 'build.a']
    v124a2ba = ['test', 1, 2, 4, 'alpha.2', 'build.a']
    v124a10ba = ['test', 1, 2, 4, 'alpha.10', 'build.a']
    v124b1ba = ['test', 1, 2, 4, 'beta.1', 'build.a']
    v124 = ['test', 1, 2, 4, '', '']

    versions = [
        v100,
        v110b1,
        v110,
        v101,
        v200,
        v123,
        v124a1bz,
        v124a1ba,
        v124a2ba,
        v124a10ba,
        v124b1ba,
        v124,
    ]
    for version in versions:
        chain.wait.for_receipt(release_db.transact().setVersion(*version[1:]))

    v100vh = release_db.call().hashVersion(*v100[1:])
    v110b1vh = release_db.call().hashVersion(*v110b1[1:])
    v110vh = release_db.call().hashVersion(*v110[1:])
    v101vh = release_db.call().hashVersion(*v101[1:])
    v200vh = release_db.call().hashVersion(*v200[1:])
    v123vh = release_db.call().hashVersion(*v123[1:])
    v124a1bzvh = release_db.call().hashVersion(*v124a1bz[1:])
    v124a1bavh = release_db.call().hashVersion(*v124a1ba[1:])
    v124a2bavh = release_db.call().hashVersion(*v124a2ba[1:])
    v124a10bavh = release_db.call().hashVersion(*v124a10ba[1:])
    v124b1bavh = release_db.call().hashVersion(*v124b1ba[1:])
    v124vh = release_db.call().hashVersion(*v124[1:])

    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v100vh, releaseLockfileURI='ipfs://some-ipfs-uri-a'))
    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v110b1vh, releaseLockfileURI='ipfs://some-ipfs-uri-b1'))
    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v110vh, releaseLockfileURI='ipfs://some-ipfs-uri-b'))
    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v101vh, releaseLockfileURI='ipfs://some-ipfs-uri-c'))
    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v200vh, releaseLockfileURI='ipfs://some-ipfs-uri-d'))
    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v123vh, releaseLockfileURI='ipfs://some-ipfs-uri-e'))
    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v124a1bzvh, releaseLockfileURI='ipfs://some-ipfs-uri-f'))
    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v124a1bavh, releaseLockfileURI='ipfs://some-ipfs-uri-g'))
    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v124a2bavh, releaseLockfileURI='ipfs://some-ipfs-uri-g'))
    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v124a10bavh, releaseLockfileURI='ipfs://some-ipfs-uri-h'))
    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v124b1bavh, releaseLockfileURI='ipfs://some-ipfs-uri-h'))
    chain.wait.for_receipt(release_db.transact().setRelease(name_hash, v124vh, releaseLockfileURI='ipfs://some-ipfs-uri-h'))

    # v200h
    # 1: v124h
    # 2: v200h
    # 1, 0: v101h
    # 1, 1: v110h
    # 1, 2: v124h
    # 2, 0: v200h
    # 1, 0, 0: v100h
    # 1, 0, 1: v101h
    # 1, 1, 0: v110h
    # 1, 2, 3: v123h
    # 1, 2, 4: v124h
    # 2, 0, 0: v200h
    v110h = release_db.call().hashRelease(name_hash, v110vh)
    v110b1h = release_db.call().hashRelease(name_hash, v110b1vh)

    assert release_db.call().getNumReleasesForNameHash(name_hash) == 12
    assert release_db.call().getLatestPatchTree(name_hash, 1, 1) == v110h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 1, 0) == v110h

    chain.wait.for_receipt(release_db.transact().removeRelease(v110h, 'testing'))

    assert release_db.call().getNumReleasesForNameHash(name_hash) == 11
    assert release_db.call().releaseExists(v110h) is False
    assert release_db.call().getLatestPatchTree(name_hash, 1, 1) == '\x00' * 32
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 1, 0) == '\x00' * 32

    # now reprocess
    for i in range(release_db.call().getNumReleasesForNameHash(name_hash)):
        rh = release_db.call().getReleaseHashForNameHash(name_hash, i)
        assert release_db.call().releaseExists(rh)
        chain.wait.for_receipt(release_db.transact().updateLatestTree(rh))

    assert release_db.call().getLatestPatchTree(name_hash, 1, 1) == v110b1h
    assert release_db.call().getLatestPreReleaseTree(name_hash, 1, 1, 0) == v110b1h
