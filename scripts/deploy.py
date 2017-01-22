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


@click.command()
@click.argument(
    'chain_name',
    nargs=1,
)
@click.option(
    'authority_address',
    '--authority',
    '-a',
    default='0x149c1a0631470aa70fc3a518af5c69d063f455ac',
)
@click.option(
    'enumerable_mapping_lib_address',
    '--enumerable-mapping-lib',
    '-e',
    default='0x6574b5754dcef9475aefa314a6e1128b7af0678a',
)
@click.option(
    'sem_version_lib_address',
    '--sem-version-lib',
    '-s',
    default='0xc09ac8d33972c17fbc07ae2a8cc5a2abf6854787',
)
@click.option(
    'indexed_ordered_set_lib_address',
    '--indexed-ordered-set-lib',
    '-o',
    default='0x2f1366851a73f2109200d7e6c43e4fa6194ea85c',
)
@click.option(
    'package_db_address',
    '--package-db',
    '-d',
    default='0xe499c6aeb304fb9aa62be285a38815209eb820a5',
)
@click.option(
    'package_index_address',
    '--package-index',
    '-i',
    default='0xa5c180ea1b8cba0ec417c32e7a3d5b556c4e0523',
)
def deploy(chain_name,
           authority_address,
           enumerable_mapping_lib_address,
           indexed_ordered_set_lib_address,
           sem_version_lib_address,
           package_db_address,
           package_index_address):
    """
    1. Deploy WhitelistAuthority
    2. Deploy Libraries:
        - EnumerableMappingLib
        - SemVersionLib
        - IndexedOrderedSetLib
    3. Deploy PackageDB
        - set Authority
    4. Deploy PackageIndex
        - set PackageDB
        - set Authority
    5. Setup Authorizations
        - PackageIndex -> PackageDB.setRelease(...)
        - PackageIndex -> PackageDB.setPackageOwner(...)
        - * -> PackageDB.setVersion(...)
        - * -> PackageDB.updateLatestTree(...)
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

        if package_db_address:
            package_db = chain.contract_factories.PackageDB(
                address=package_db_address,
            )
        else:
            if enumerable_mapping_lib_address:
                enumerable_mapping_lib = chain.contract_factories.EnumerableMappingLib(
                    address=enumerable_mapping_lib_address,
                )
            else:
                enumerable_mapping_lib = deploy_contract(chain, 'EnumerableMappingLib')

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
                'EnumerableMappingLib': enumerable_mapping_lib.address,
                'SemVersionLib': sem_version_lib.address,
                'IndexedOrderedSetLib': indexed_ordered_set_lib.address,
            }
            package_db = deploy_contract(chain, 'PackageDB', link_dependencies=link_dependencies)

        if package_index_address:
            package_index = chain.contract_factories.PackageIndex(address=package_index_address)
        else:
            package_index = deploy_contract(chain, 'PackageIndex')

        click.echo("Beginning permission setup.")

        set_package_db_address_on_package_index(chain, package_index, package_db)
        set_authority(chain, authority, package_db)
        set_authority(chain, authority, package_index)

        set_can_call(
            chain=chain,
            authority=authority,
            caller_address=package_index.address,
            code_address=package_db.address,
            can_call=True,
            function_signature="setRelease(string,uint32,uint32,uint32,string,string,string)",
        )
        set_can_call(
            chain=chain,
            authority=authority,
            caller_address=package_index.address,
            code_address=package_db.address,
            can_call=True,
            function_signature="setPackageOwner(bytes32,address)",
        )
        set_anyone_can_call(
            chain=chain,
            authority=authority,
            code_address=package_db.address,
            can_call=True,
            function_signature="setVersion(uint32,uint32,uint32,string,string)",
        )
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
