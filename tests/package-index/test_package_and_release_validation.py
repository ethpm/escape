import pytest


def test_cannot_release_version_0(chain,
                                  package_index):
    assert package_index.call().packageExists('test') is False

    chain.wait.for_receipt(package_index.transact().release(
        'test', 0, 0, 0, '', '', 'ipfs://some-ipfs-uri',
    ))

    assert package_index.call().packageExists('test') is False
    assert package_index.call().releaseExists('test', 0, 0, 0, '', '') is False


@pytest.mark.parametrize(
    ('version'),
    (
        (1, 0, 0, ''),
        (1, 1, 0, ''),
        (1, 1, 1, ''),
        (1, 1, 1, 'beta.1'),
    )
)
def test_cannot_release_already_released_version(chain,
                                                 package_index,
                                                 package_db,
                                                 release_db,
                                                 version):
    name_hash = package_db.call().hashName('test')
    version_hash = release_db.call().hashVersion(*version, build='')
    release_hash = release_db.call().hashRelease(name_hash, version_hash)

    assert package_index.call().packageExists('test') is False

    chain.wait.for_receipt(package_index.transact().release(
        'test', *version, build='', releaseLockfileURI='ipfs://some-ipfs-uri',
    ))

    assert package_index.call().packageExists('test') is True
    assert package_index.call().getPackageData('test')[2] == 1
    assert package_index.call().getReleaseData(release_hash)[-3] == 'ipfs://some-ipfs-uri'

    chain.wait.for_receipt(package_index.transact().release(
        'test', *version, build='', releaseLockfileURI='ipfs://some-other-ipfs-uri',
    ))

    assert package_index.call().packageExists('test') is True
    assert package_index.call().getPackageData('test')[2] == 1
    assert package_index.call().getReleaseData(release_hash)[-3] == 'ipfs://some-ipfs-uri'


@pytest.mark.parametrize(
    ('version_a,version_b'),
    (
        ((2, 0, 0, ''), (1, 0, 0, '')),
        ((1, 2, 0, ''), (1, 1, 0, '')),
        ((1, 0, 2, ''), (1, 0, 1, '')),
        ((1, 0, 0, 'alpha.10'), (1, 0, 0, 'alpha.2')),
    )
)
def test_cannot_backfile_version(chain,
                                 package_index,
                                 version_a,
                                 version_b):
    assert package_index.call().packageExists('test') is False
    assert package_index.call().releaseExists('test', *version_a, build='') is False
    assert package_index.call().releaseExists('test', *version_b, build='') is False

    chain.wait.for_receipt(package_index.transact().release(
        'test', *version_a, build='', releaseLockfileURI='ipfs://some-ipfs-uri',
    ))

    assert package_index.call().packageExists('test') is True
    assert package_index.call().getPackageData('test')[2] == 1
    assert package_index.call().releaseExists('test', *version_a, build='') is True
    assert package_index.call().releaseExists('test', *version_b, build='') is False

    chain.wait.for_receipt(package_index.transact().release(
        'test', *version_b, build='', releaseLockfileURI='ipfs://some-ipfs-uri',
    ))

    assert package_index.call().packageExists('test') is True
    assert package_index.call().getPackageData('test')[2] == 1
    assert package_index.call().releaseExists('test', *version_a, build='') is True
    assert package_index.call().releaseExists('test', *version_b, build='') is False


@pytest.mark.parametrize(
    ('package_name,is_valid'),
    (
        # Good Names
        ('aa', True),
        ('a' * 214, True),
        ('contains-dashes', True),
        ('contains-1234567890-numbers', True),
        ('contains-abcdefghijklmnopqrstuvwxyz-1234567890-all-allowed-chars', True),
        # Bad Names
        ('a', False), # too short
        ('a' * 215, False),  # too long
        ('-starts-with-dash', False),  # starts with a dash
        ('9starts-with-number', False),  # starts with a number
        ('hasCapitals', False),  # contains capital letters.
        ('Starts-with-capital', False),  # starts with capital letters.
        ('with_underscore', False),  # contains an underscore
        ('with.period', False),  # contains a period
        ('with$money-symbol', False),  # contains a $
        ('with()parenthesis', False),  # contains parenthesis
    )
)
def test_package_index_rejects_invalid_package_names(chain,
                                                     package_index,
                                                     package_name,
                                                     is_valid):
    assert package_index.call().packageExists(package_name) is False

    chain.wait.for_receipt(package_index.transact().release(
        package_name, 1, 0, 0, '', '', 'ipfs://some-ipfs-uri',
    ))

    assert package_index.call().packageExists(package_name) is is_valid


def test_empty_lockfile_URI_not_allowed(chain,
                                        package_index):
    assert package_index.call().packageExists('test') is False

    chain.wait.for_receipt(package_index.transact().release(
        'test', 1, 0, 0, '', '', '',
    ))

    assert package_index.call().packageExists('test') is False
