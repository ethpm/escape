import click

from populus import Project


@click.command()
@click.argument(
    'chain_name',
    nargs=1,
)
@click.option(
    'authority_address',
    '--authority',
    '-a',
    default='0x06658b994d95d1e8432192b9e3c0b2dbce6fe66f',
)
@click.option(
    'sem_version_lib_address',
    '--sem-version-lib',
    '-s',
    default='0xd49cce0631b148a61e562f32ef53605cebd593cb',
)
@click.option(
    'indexed_ordered_set_lib_address',
    '--indexed-ordered-set-lib',
    '-o',
    default='0x0a038b2b9b1be306aee706aabd9d402cb66eb02f',
)
@click.option(
    'package_db_address',
    '--package-db',
    '-d',
    default='0x489d3a2c3b0f392fa780ab76a17f1586fd19e77c',
)
@click.option(
    'release_db_address',
    '--release-db',
    '-r',
    default='0x666495528e96a6fc3bb809151d3a73f1cf2585f9',
)
@click.option(
    'release_validator_address',
    '--release-validator',
    '-v',
    default='0x5b745832e56ab7b97990890161b43db4ce0aa6cc',
)
@click.option(
    'package_index_address',
    '--package-index',
    '-i',
    default='0x8011df4830b4f696cd81393997e5371b93338878',
)
def repl(chain_name,
         authority_address,
         indexed_ordered_set_lib_address,
         sem_version_lib_address,
         package_db_address,
         release_db_address,
         release_validator_address,
         package_index_address):
    """
    Enter a python REPL with all the contracts available.
    """
    project = Project()
    click.echo("Starting {0} chain... ".format(chain_name), nl=False)
    with project.get_chain(chain_name) as chain:
        click.echo("STARTED")
        web3 = chain.web3
        authority = chain.contract_factories.WhitelistAuthority(address=authority_address)
        release_validator = chain.contract_factories.ReleaseValidator(address=release_validator_address)
        sem_version_lib = chain.contract_factories.SemVersionLib(
            address=sem_version_lib_address,
        )
        indexed_ordered_set_lib = chain.contract_factories.IndexedOrderedSetLib(
            address=indexed_ordered_set_lib_address,
        )
        package_db = chain.contract_factories.PackageDB(
            address=package_db_address,
        )
        release_db = chain.contract_factories.ReleaseDB(
            address=release_db_address,
        )
        package_index = chain.contract_factories.PackageIndex(address=package_index_address)

        import pdb; pdb.set_trace()

        pass


if __name__ == '__main__':
    repl()
