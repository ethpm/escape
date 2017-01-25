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
    default='0x29658b7e2d9e7607ad57a93171a066bd073e7c17',
)
@click.option(
    'sem_version_lib_address',
    '--sem-version-lib',
    '-s',
    default='0xd432635fa80bcf7d63bbf494d4ada4179559b286',
)
@click.option(
    'indexed_ordered_set_lib_address',
    '--indexed-ordered-set-lib',
    '-o',
    default='0xb61cf6fe13fe544b67d6ed95f2596ea36082b1a3',
)
@click.option(
    'package_db_address',
    '--package-db',
    '-d',
    default='0xc8bfa2fcefc0f8ae7b7b542f8e9b45145dce4e77',
)
@click.option(
    'release_db_address',
    '--release-db',
    '-r',
    default='0xa6d6ae350583b93ad1bd03f25aaba2050d467183',
)
@click.option(
    'release_validator_address',
    '--release-validator',
    '-v',
    default='0xedcee68a853c74aed5f593349af41495e75de0e1',
)
@click.option(
    'package_index_address',
    '--package-index',
    '-i',
    default='0xbab799ff7d9e13a50696a8bebb7a1b77ae519586',
)
def deploy(chain_name,
           authority_address,
           indexed_ordered_set_lib_address,
           sem_version_lib_address,
           package_db_address,
           release_db_address,
           release_validator_address,
           package_index_address):
    """
    #. Deploy WhitelistAuthority
    #. Deploy Libraries:
        - EnumerableMappingLib
        - SemVersionLib
        - IndexedOrderedSetLib
    #. Deploy PackageDB
        - set Authority
    #. Deploy ReleaseDB
        - set Authority
    #. Deploy ReleaseValidator
    #. Deploy PackageIndex
        - set PackageDB
        - set Authority
    #. Setup Authorizations
        - PackageIndex -> PackageDB.setPackage(...)
        - PackageIndex -> PackageDB.setPackageOwner(...)
        - PackageIndex -> ReleaseDB.setRelease(...)
        - * -> ReleaseDB.setVersion(...)
        - * -> ReleaseDB.updateLatestTree(...)
        - * -> PackageIndex.release(...)
        - * -> PackageIndex.transferPackageOwner(...)
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

        x = 3


if __name__ == '__main__':
    deploy()
