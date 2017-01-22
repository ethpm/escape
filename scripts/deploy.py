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
    click.echo("Setting {0} as authority for {1}".format(authority.address, contract_instance.address))
    click.echo("Sending set transaction... ", nl=False)
    set_txn_hash = contract_instance.transact().setAuthority(authority.address)
    click.echo("SENT")
    click.echo("Set Transaction Hash: {0}".format(set_txn_hash))
    click.echo("Waiting for transaction to be mined... ", nl=False)
    chain.wait.for_contract_address(deploy_txn_hash, timeout=600)
    click.echo("MINED")

    if contract_instance.call().authority() != authority.address:
        click.echo("Something is wrong.  Authority was not set")
        import pdb; pdb.set_trace()
        raise ValueError("Something went wrong")
    return


def set_can_call(authority, caller_address, code_address, can_call, function_signature):
    sig_as_hex = function_signature_to_4byte_selector(function_signature)
    sig_as_bytes = decode_hex(sig_as_hex)
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
    click.wait.for_receipt(authorize_txn_hash, timeout=600)
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


@click.command()
@click.argument(
    'chain_name',
    nargs=1,
)
def deploy(chain_name):
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

        authority = deploy_contract(chain, 'Authority')
        enumerable_mapping_lib = deploy_contract(chain, 'EnumerableMappingLib')
        sem_version_lib = deploy_contract(chain, 'SemVersionLib')
        indexed_ordered_set_lib = deploy_contract(chain, 'IndexedOrderedSetLib')

        link_dependencies = {
            'EnumerableMappingLib': enumerable_mapping_lib.address,
            'SemVersionLib': sem_version_lib.address,
            'IndexedOrderedSetLib': indexed_ordered_set_lib.address,
        }
        package_db = deploy_contract(chain, 'PackageDB', link_dependencies=link_dependencies)
        package_index = deploy_contract(chain, 'PackageIndex')

        click.echo("Setting up permissions")


if __name__ == '__main__':
    deploy()
