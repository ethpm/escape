import pytest



def test_enumerating_package_names(chain, package_db):
    package_names = ['test-{0}'.format(i) for i in range(5)]
    package_name_hashes = [package_db.call().hashName(name) for name in package_names]

    for name in package_names:
        chain.wait.for_receipt(package_db.transact().setPackage(name))

    assert package_db.call().getNumPackages() == 5

    for idx, name_hash in enumerate(package_name_hashes):
        assert package_db.call().getPackageNameHash(idx) == name_hash
        assert package_db.call().getPackageName(name_hash) == package_names[idx]
