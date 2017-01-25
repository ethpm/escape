import click

from web3.utils.abi import function_signature_to_4byte_selector
from web3.utils.encoding import decode_hex

from populus import Project


def verify_bytecode(web3, ContractFactory, contract_address):
    # Verification
    deployed_code = web3.eth.getCode(contract_address)

    click.echo("Verifying deployed bytecode...")
    is_bytecode_match = deployed_code == ContractFactory.code_runtime
    if is_bytecode_match:
        click.echo(
            "Verified contract bytecode @ {0} matches expected runtime "
            "bytecode".format(contract_address)
        )
    else:
        click.echo(
            "Bytecode @ {0} does not match expected contract bytecode.\n\n"
            "expected : '{1}'\n"
            "actual   : '{2}'\n".format(
                contract_address,
                ContractFactory.code_runtime,
                deployed_code,
            ),
            err=True,
        )
        raise click.ClickException("Error deploying contract")


def deploy_contract(chain, contract_name, **kwargs):
    click.echo("Loading {0} contract... ".format(contract_name), nl=False)
    ContractFactory = chain.get_contract_factory(contract_name, **kwargs)
    click.echo("LOADED")

    click.echo("Sending deploy transaction for {0} contract... ".format(contract_name), nl=False)
    deploy_txn_hash = ContractFactory.deploy()
    click.echo("SENT")
    click.echo("Deploy Transaction Hash: {0}".format(deploy_txn_hash))

    click.echo("Waiting for transaction to be mined... ", nl=False)
    contract_address = chain.wait.for_contract_address(deploy_txn_hash, timeout=600)
    click.echo("MINED")

    verify_bytecode(chain.web3, ContractFactory, contract_address)

    click.echo("{0} deployed @ {1}".format(contract_name, contract_address))

    contract_instance = ContractFactory(address=contract_address)
    return contract_instance


def set_authority(chain, authority, contract_instance):
    if contract_instance.call().authority() == authority.address:
        click.echo("Authority already set on {0}".format(contract_instance.address))
        return

    click.echo("Setting {0} as authority for {1}".format(authority.address, contract_instance.address))
    click.echo("Sending set transaction... ", nl=False)
    set_txn_hash = contract_instance.transact().setAuthority(authority.address)
    click.echo("SENT")
    click.echo("Set Transaction Hash: {0}".format(set_txn_hash))
    click.echo("Waiting for transaction to be mined... ", nl=False)
    chain.wait.for_receipt(set_txn_hash, timeout=600)
    click.echo("MINED")

    if contract_instance.call().authority() != authority.address:
        click.echo("Something is wrong.  Authority was not set")
        import pdb; pdb.set_trace()
        raise ValueError("Something went wrong")
    return


def set_can_call(chain, authority, caller_address, code_address, can_call, function_signature):
    sig_as_hex = function_signature_to_4byte_selector(function_signature)
    sig_as_bytes = decode_hex(sig_as_hex)

    can_already_call = authority.call().canCall(
        callerAddress=caller_address,
        codeAddress=code_address,
        sig=sig_as_bytes,
    )
    if can_already_call:
        click.echo("Permissions already set for: {0}".format(function_signature))
        return

    click.echo(
        "Setting up permissions for:\n"
        "- function: {0}\n"
        "- sig: {1}\n"
        "- caller_address: {2}\n"
        "- code_address: {3}\n"
        "- can_call: {4}".format(
            function_signature,
            sig_as_hex,
            caller_address,
            code_address,
            ("Yes" if can_call else "No"),
        )
    )
    click.echo("Sending authorization transaction... ", nl=False)
    authorize_txn_hash = authority.transact().setCanCall(
        callerAddress=caller_address,
        codeAddress=code_address,
        sig=sig_as_bytes,
        can=can_call,
    )
    click.echo("SENT")
    click.echo("Authorize Transaction Hash: {0}".format(authorize_txn_hash))
    click.echo("Waiting for transaction to be mined... ", nl=False)
    chain.wait.for_receipt(authorize_txn_hash, timeout=600)
    click.echo("MINED")

    check_can_call = authority.call().canCall(
        callerAddress=caller_address,
        codeAddress=code_address,
        sig=sig_as_bytes,
    )
    if check_can_call is not can_call:
        click.echo("Something went wrong.  Authorization did not go though")
        import pdb; pdb.set_trace()
        raise ValueError("Failed to set authorization")
    return


def set_anyone_can_call(chain, authority, code_address, can_call, function_signature):
    sig_as_hex = function_signature_to_4byte_selector(function_signature)
    sig_as_bytes = decode_hex(sig_as_hex)

    can_already_call = authority.call().canCall(
        callerAddress='0x0000000000000000000000000000000000000000',
        codeAddress=code_address,
        sig=sig_as_bytes,
    )
    if can_already_call:
        click.echo("Permissions already set for: {0}".format(function_signature))
        return

    click.echo(
        "Setting up permissions for:\n"
        "- function: {0}\n"
        "- sig: {1}\n"
        "- code_address: {2}\n"
        "- can_call: {3}".format(
            function_signature,
            sig_as_hex,
            code_address,
            ("Yes" if can_call else "No"),
        )
    )
    click.echo("Sending whitelist authorization transaction... ", nl=False)
    authorize_txn_hash = authority.transact().setAnyoneCanCall(
        codeAddress=code_address,
        sig=sig_as_bytes,
        can=can_call,
    )
    click.echo("SENT")
    click.echo("Whitelist Authorize Transaction Hash: {0}".format(authorize_txn_hash))
    click.echo("Waiting for transaction to be mined... ", nl=False)
    chain.wait.for_receipt(authorize_txn_hash, timeout=600)
    click.echo("MINED")

    check_can_call = authority.call().canCall(
        callerAddress='0x0000000000000000000000000000000000000000',
        codeAddress=code_address,
        sig=sig_as_bytes,
    )
    if check_can_call is not can_call:
        click.echo("Something went wrong.  Authorization did not go though")
        import pdb; pdb.set_trace()
        raise ValueError("Failed to set authorization")
    return


def set_package_db_address_on_package_index(chain, package_index, package_db):
    if package_index.call().packageDb() == package_db.address:
        click.echo("Package DB Address already set")
        return
    click.echo("Setting PackageDB address for PackageIndex contract")
    click.echo("Sending set transaction... ", nl=False)
    set_txn_hash = package_index.transact().setPackageDb(package_db.address)
    click.echo("SENT")
    click.echo("Set Transaction Hash: {0}".format(set_txn_hash))
    click.echo("Waiting for transaction to be mined... ", nl=False)
    chain.wait.for_receipt(set_txn_hash, timeout=600)
    click.echo("MINED")

    if package_index.call().packageDb() != package_db.address:
        click.echo("Something is wrong. PackageDb address not set on index.")
        import pdb; pdb.set_trace()
        raise ValueError("Something failed")
    return


def set_release_db_address_on_package_index(chain, package_index, release_db):
    if package_index.call().releaseDb() == release_db.address:
        click.echo("Release DB Address already set")
        return
    click.echo("Setting ReleaseDB address for ReleaseIndex contract")
    click.echo("Sending set transaction... ", nl=False)
    set_txn_hash = package_index.transact().setReleaseDb(release_db.address)
    click.echo("SENT")
    click.echo("Set Transaction Hash: {0}".format(set_txn_hash))
    click.echo("Waiting for transaction to be mined... ", nl=False)
    chain.wait.for_receipt(set_txn_hash, timeout=600)
    click.echo("MINED")

    if package_index.call().releaseDb() != release_db.address:
        click.echo("Something is wrong. ReleaseDb address not set on index.")
        import pdb; pdb.set_trace()
        raise ValueError("Something failed")
    return


def set_release_validator_address_on_package_index(chain, package_index, release_validator):
    if package_index.call().releaseValidator() == release_validator.address:
        click.echo("ReleaseValidator Address already set")
        return
    click.echo("Setting ReleaseValidator address for ReleaseIndex contract")
    click.echo("Sending set transaction... ", nl=False)
    set_txn_hash = package_index.transact().setReleaseValidator(release_validator.address)
    click.echo("SENT")
    click.echo("Set Transaction Hash: {0}".format(set_txn_hash))
    click.echo("Waiting for transaction to be mined... ", nl=False)
    chain.wait.for_receipt(set_txn_hash, timeout=600)
    click.echo("MINED")

    if package_index.call().releaseValidator() != release_validator.address:
        click.echo("Something is wrong. ReleaseDb address not set on index.")
        import pdb; pdb.set_trace()
        raise ValueError("Something failed")
    return


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
        click.echo(
            "Waiting for account {} to be unlocked... ".format(web3.eth.coinbase),
            nl=False,
        )
        chain.wait.for_unlock(web3.eth.coinbase, timeout=600)
        click.echo("UNLOCKED")

        if authority_address:
            authority = chain.contract_factories.WhitelistAuthority(address=authority_address)
        else:
            authority = deploy_contract(chain, 'WhitelistAuthority')

        if release_validator_address:
            release_validator = chain.contract_factories.ReleaseValidator(address=release_validator_address)
        else:
            release_validator = deploy_contract(chain, 'ReleaseValidator')

        if sem_version_lib_address:
            sem_version_lib = chain.contract_factories.SemVersionLib(
                address=sem_version_lib_address,
            )
        else:
            sem_version_lib = deploy_contract(chain, 'SemVersionLib')

        if indexed_ordered_set_lib_address:
            indexed_ordered_set_lib = chain.contract_factories.IndexedOrderedSetLib(
                address=indexed_ordered_set_lib_address,
            )
        else:
            indexed_ordered_set_lib = deploy_contract(chain, 'IndexedOrderedSetLib')

        link_dependencies = {
            'SemVersionLib': sem_version_lib.address,
            'IndexedOrderedSetLib': indexed_ordered_set_lib.address,
        }

        if package_db_address:
            package_db = chain.contract_factories.PackageDB(
                address=package_db_address,
            )
        else:
            package_db = deploy_contract(chain, 'PackageDB', link_dependencies=link_dependencies)

        if release_db_address:
            release_db = chain.contract_factories.ReleaseDB(
                address=release_db_address,
            )
        else:
            release_db = deploy_contract(chain, 'ReleaseDB', link_dependencies=link_dependencies)

        if package_index_address:
            package_index = chain.contract_factories.PackageIndex(address=package_index_address)
        else:
            package_index = deploy_contract(chain, 'PackageIndex')

        click.echo("Beginning permission setup.")

        set_package_db_address_on_package_index(chain, package_index, package_db)
        set_release_db_address_on_package_index(chain, package_index, release_db)
        set_release_validator_address_on_package_index(chain, package_index, release_validator)

        set_authority(chain, authority, package_db)
        set_authority(chain, authority, release_db)
        set_authority(chain, authority, package_index)

        # Release DB
        set_can_call(
            chain=chain,
            authority=authority,
            caller_address=package_index.address,
            code_address=release_db.address,
            can_call=True,
            function_signature="setRelease(bytes32,bytes32,string)",
        )
        set_anyone_can_call(
            chain=chain,
            authority=authority,
            code_address=release_db.address,
            can_call=True,
            function_signature="setVersion(uint32,uint32,uint32,string,string)",
        )
        set_anyone_can_call(
            chain=chain,
            authority=authority,
            code_address=release_db.address,
            can_call=True,
            function_signature="updateLatestTree(bytes32)",
        )

        # Package DB
        set_can_call(
            chain=chain,
            authority=authority,
            caller_address=package_index.address,
            code_address=package_db.address,
            can_call=True,
            function_signature="setPackage(string)",
        )
        set_can_call(
            chain=chain,
            authority=authority,
            caller_address=package_index.address,
            code_address=package_db.address,
            can_call=True,
            function_signature="setPackageOwner(bytes32,address)",
        )

        # Package Index
        set_anyone_can_call(
            chain=chain,
            authority=authority,
            code_address=package_index.address,
            can_call=True,
            function_signature="release(string,uint32,uint32,uint32,string,string,string)",
        )
        set_anyone_can_call(
            chain=chain,
            authority=authority,
            code_address=package_index.address,
            can_call=True,
            function_signature="transferPackageOwner(string,address)",
        )
        click.echo("Finished permission setup.")


if __name__ == '__main__':
    deploy()
