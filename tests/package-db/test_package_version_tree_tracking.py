def test_release_version_tree_tracking(chain, package_db):
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

    v100h = package_db.call().hashRelease(*v100)
    v110h = package_db.call().hashRelease(*v110)
    v101h = package_db.call().hashRelease(*v101)
    v200h = package_db.call().hashRelease(*v200)
    v123h = package_db.call().hashRelease(*v123)
    v124a1bzh = package_db.call().hashRelease(*v124a1bz)
    v124a1bah = package_db.call().hashRelease(*v124a1ba)
    v124a2bah = package_db.call().hashRelease(*v124a2ba)
    v124a10bah = package_db.call().hashRelease(*v124a10ba)
    v124b1bah = package_db.call().hashRelease(*v124b1ba)
    v124h = package_db.call().hashRelease(*v124)

    chain.wait.for_receipt(package_db.transact().setRelease(*v100, releaseLockFileURI=''))

    assert package_db.call().getNumReleases('test') == 1

    assert package_db.call().getLatestMajorTree(name_hash) == v100h
    assert package_db.call().getLatestMinorTree(name_hash, 1) == v100h
    assert package_db.call().getLatestPatchTree(name_hash, 1, 0) == v100h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 0) == v100h

    chain.wait.for_receipt(package_db.transact().setRelease(*v110, releaseLockFileURI=''))

    assert package_db.call().getNumReleases('test') == 2

    assert package_db.call().getLatestMajorTree(name_hash) == v110h
    assert package_db.call().getLatestMinorTree(name_hash, 1) == v110h
    assert package_db.call().getLatestPatchTree(name_hash, 1, 0) == v100h
    assert package_db.call().getLatestPatchTree(name_hash, 1, 1) == v110h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 0) == v100h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 1, 0) == v110h

    chain.wait.for_receipt(package_db.transact().setRelease(*v101, releaseLockFileURI=''))

    assert package_db.call().getNumReleases('test') == 3

    assert package_db.call().getLatestMajorTree(name_hash) == v110h
    assert package_db.call().getLatestMinorTree(name_hash, 1) == v110h
    assert package_db.call().getLatestPatchTree(name_hash, 1, 0) == v101h
    assert package_db.call().getLatestPatchTree(name_hash, 1, 1) == v110h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 0) == v100h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 1) == v101h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 1, 0) == v110h

    chain.wait.for_receipt(package_db.transact().setRelease(*v200, releaseLockFileURI=''))

    assert package_db.call().getNumReleases('test') == 4

    assert package_db.call().getLatestMajorTree(name_hash) == v200h
    assert package_db.call().getLatestMinorTree(name_hash, 1) == v110h
    assert package_db.call().getLatestMinorTree(name_hash, 2) == v200h
    assert package_db.call().getLatestPatchTree(name_hash, 1, 0) == v101h
    assert package_db.call().getLatestPatchTree(name_hash, 1, 1) == v110h
    assert package_db.call().getLatestPatchTree(name_hash, 2, 0) == v200h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 0) == v100h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 1) == v101h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 1, 0) == v110h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 2, 0, 0) == v200h

    chain.wait.for_receipt(package_db.transact().setRelease(*v123, releaseLockFileURI=''))

    assert package_db.call().getNumReleases('test') == 5

    assert package_db.call().getLatestMajorTree(name_hash) == v200h
    assert package_db.call().getLatestMinorTree(name_hash, 1) == v123h
    assert package_db.call().getLatestMinorTree(name_hash, 2) == v200h
    assert package_db.call().getLatestPatchTree(name_hash, 1, 0) == v101h
    assert package_db.call().getLatestPatchTree(name_hash, 1, 1) == v110h
    assert package_db.call().getLatestPatchTree(name_hash, 1, 2) == v123h
    assert package_db.call().getLatestPatchTree(name_hash, 2, 0) == v200h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 0) == v100h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 1) == v101h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 1, 0) == v110h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 2, 3) == v123h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 2, 0, 0) == v200h

    chain.wait.for_receipt(package_db.transact().setRelease(*v124a1bz, releaseLockFileURI=''))

    assert package_db.call().getNumReleases('test') == 6

    assert package_db.call().getLatestMajorTree(name_hash) == v200h
    assert package_db.call().getLatestMinorTree(name_hash, 1) == v124a1bzh
    assert package_db.call().getLatestMinorTree(name_hash, 2) == v200h
    assert package_db.call().getLatestPatchTree(name_hash, 1, 0) == v101h
    assert package_db.call().getLatestPatchTree(name_hash, 1, 1) == v110h
    assert package_db.call().getLatestPatchTree(name_hash, 1, 2) == v124a1bzh
    assert package_db.call().getLatestPatchTree(name_hash, 2, 0) == v200h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 0) == v100h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 1) == v101h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 1, 0) == v110h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 2, 3) == v123h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 2, 4) == v124a1bzh
    assert package_db.call().getLatestPreReleaseTree(name_hash, 2, 0, 0) == v200h

    chain.wait.for_receipt(package_db.transact().setRelease(*v124a1ba, releaseLockFileURI=''))

    assert package_db.call().getNumReleases('test') == 7

    assert package_db.call().getLatestMajorTree(name_hash) == v200h
    assert package_db.call().getLatestMinorTree(name_hash, 1) == v124a1bah
    assert package_db.call().getLatestMinorTree(name_hash, 2) == v200h
    assert package_db.call().getLatestPatchTree(name_hash, 1, 0) == v101h
    assert package_db.call().getLatestPatchTree(name_hash, 1, 1) == v110h
    assert package_db.call().getLatestPatchTree(name_hash, 1, 2) == v124a1bah
    assert package_db.call().getLatestPatchTree(name_hash, 2, 0) == v200h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 0) == v100h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 0, 1) == v101h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 1, 0) == v110h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 2, 3) == v123h
    assert package_db.call().getLatestPreReleaseTree(name_hash, 1, 2, 4) == v124a1bah
    assert package_db.call().getLatestPreReleaseTree(name_hash, 2, 0, 0) == v200h
