def test_gas_usage_for_large_deploy_data(chain, package_index):
    package_name = 'a' * 214
    receipt_a = chain.wait.for_receipt(package_index.transact().release(
        name=package_name,
        major=1,
        minor=2,
        patch=3,
        preRelease='alpha.1.beta.2.delta.3.gamma.4',
        build='4f18c7a18a7de27cf3fbeff31feccdce570d410b',
        releaseLockfileURI='ipfs://QmZrAGa3YwWPkop11vDZjfSmQGWGzjXkh6J3ns7AbENu73',
    ))

    assert package_index.call().getPackageData(package_name)[2] == 1
    assert receipt_a['gasUsed'] < 2000000

    receipt_b = chain.wait.for_receipt(package_index.transact().release(
        name=package_name,
        major=1,
        minor=2,
        patch=3,
        preRelease='alpha.1.beta.2.delta.3.gamma.4.xray.5',
        build='b9953be8e1bdbfd70ed998a5111f0c3ed0cebf46',
        releaseLockfileURI='ipfs://QmZrAGa3YwWPkop11vDZjfSmQGWGzjXkh6J3ns7AbENu73',
    ))

    assert package_index.call().getPackageData(package_name)[2] == 2
    assert receipt_b['gasUsed'] < 2000000
