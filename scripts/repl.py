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
    default='0xd5bf8d280769df415afbb08a2c04cae8ec432b34',
)
@click.option(
    'sem_version_lib_address',
    '--sem-version-lib',
    '-s',
    default='0x6bb44911287f12deb91f7d262c16ac7ce06f37d8',
)
@click.option(
    'indexed_ordered_set_lib_address',
    '--indexed-ordered-set-lib',
    '-o',
    default='0x6ec0e64f91dab19d23360752f2743c44762796a2',
)
@click.option(
    'package_db_address',
    '--package-db',
    '-d',
    default='0x7b1b9e4c7e054e0a27b766193762f7b59653236c',
)
@click.option(
    'release_db_address',
    '--release-db',
    '-r',
    default='0x974b8c7f490ceb30d24932a45a386d0b29840cec',
)
@click.option(
    'release_validator_address',
    '--release-validator',
    '-v',
    default='0xba3433d7d23120ce7dce153db02383a94fcf9bc1',
)
@click.option(
    'package_index_address',
    '--package-index',
    '-i',
    default='0xc5dadcbf033bbc7c634445cd8b60eb504ef348d1',
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
