import click

import semver


from populus import Project


EXAMPLE_PACKAGES = (
    ('epm-owned', '1.0.0', 'ipfs://QmUwVUMVtkVctrLDeL12SoeCPUacELBU8nAxRtHUzvtjND'),
    ('epm-transferable', '1.0.0', 'ipfs://QmaTMa6MwtH6CisPypiFkFdd1ByrFAvdExcQkUQwqbMeZx'),
    ('epm-standard-token', '1.0.0', 'ipfs://QmegJYswSDXUJbKWBuTj7AGBY15XceKxnF1o1Vo2VvVPLQ'),
    ('epm-piper-coin', '1.0.0', 'ipfs://QmYxRT4k5ByUH4N4A455M5s1RxsgUfqyYrntcuuxdHezXv'),
    ('epm-safe-math-lib', '1.0.0', 'ipfs://QmfUwis9K2SLwnUh62PDb929JzU5J2aFKd4kS1YErYajdq'),
    ('epm-escrow', '1.0.0', 'ipfs://Qmb4YtjwsAQyYXmCwSF71Lez9d7qchPc6WkT2iGc9m1gX6'),
    ('epm-wallet', '1.0.0', 'ipfs://QmSg2QvGhQrYgQqbTGVYjGmF9hkEZrxQNmSXsr8fFyYtD4'),
)


def publish_release(chain, package_index, package_name, version_string, release_lockfile_uri):
    click.echo(
        "Publishing '{0}' package @ {1} with lockfile URI {2}".format(
            package_name,
            version_string,
            release_lockfile_uri,
        )
    )
    version_info = semver.parse_version_info(version_string)
    release_exists = package_index.call().releaseExists(
        name=package_name,
        major=version_info.major,
        minor=version_info.minor,
        patch=version_info.patch,
        preRelease=version_info.prerelease or '',
        build=version_info.build or '',
    )
    if release_exists:
        click.echo("Release already published.")
        return

    click.echo("Sending release transaction... ", nl=False)
    release_txn_hash = package_index.transact().release(
        name=package_name,
        major=version_info.major,
        minor=version_info.minor,
        patch=version_info.patch,
        preRelease=version_info.prerelease or '',
        build=version_info.build or '',
        releaseLockfileURI=release_lockfile_uri,
    )
    click.echo("SENT")
    click.echo("Release Transaction Hash: {0}".format(release_txn_hash))
    click.echo("Waiting for transaction to be mined... ", nl=False)
    chain.wait.for_receipt(release_txn_hash, timeout=600)
    click.echo("MINED")

    was_successful = package_index.call().releaseExists(
        name=package_name,
        major=version_info.major,
        minor=version_info.minor,
        patch=version_info.patch,
        preRelease=version_info.prerelease or '',
        build=version_info.build or '',
    )
    if not was_successful:
        click.echo("Something went wrong.  Release does not exist")
        import pdb; pdb.set_trace()
        raise ValueError("Something failed")
    return


@click.command()
@click.argument(
    'chain_name',
    nargs=1,
)
@click.option(
    'package_index_address',
    '--package-index',
    '-i',
    default='0xbab799ff7d9e13a50696a8bebb7a1b77ae519586',
)
def load_examples(chain_name,
                  package_index_address):
    """
    Load the e
    """
    project = Project()
    click.echo("Starting {0} chain... ".format(chain_name), nl=False)
    with project.get_chain(chain_name) as chain:
        click.echo("STARTED")
        web3 = chain.web3
        click.echo(
            "Waiting for account {} to be unlocked... ".format(web3.eth.coinbase),
            nl=False,
        )
        chain.wait.for_unlock(web3.eth.coinbase, timeout=600)
        click.echo("UNLOCKED")

        if not package_index_address:
            raise ValueError("Must provide package index address")

        package_index = chain.contract_factories.PackageIndex(address=package_index_address)

        for package_name, version_string, release_lockfile_uri in EXAMPLE_PACKAGES:
            publish_release(
                chain,
                package_index,
                package_name,
                version_string,
                release_lockfile_uri,
            )


if __name__ == '__main__':
    load_examples()
