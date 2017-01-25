import pytest

import itertools

from web3.utils.abi import function_signature_to_4byte_selector
from web3.utils.encoding import decode_hex


@pytest.fixture()
def authority(chain, accounts):
    authority_owner = accounts[5]
    _authority = chain.get_contract(
        'WhitelistAuthority',
        deploy_transaction={'from': authority_owner},
    )
    assert _authority.call().owner() == authority_owner
    return _authority


@pytest.fixture()
def authorize_call(chain, authority):
    def _authorize_call(caller_address, code_address, function_signature, can_call):
        sig = decode_hex(function_signature_to_4byte_selector(function_signature))
        chain.wait.for_receipt(authority.transact({
            'from': authority.call().owner(),
        }).setCanCall(
            callerAddress=caller_address,
            codeAddress=code_address,
            sig=sig,
            can=can_call,
        ))
        assert authority.call().canCall(
            callerAddress=caller_address,
            codeAddress=code_address,
            sig=sig,
        ) is can_call
    return _authorize_call


@pytest.fixture()
def whitelist_call(chain, authority):
    def _whitelist_call(code_address, function_signature, can_call):
        sig = decode_hex(function_signature_to_4byte_selector(function_signature))
        chain.wait.for_receipt(authority.transact({
            'from': authority.call().owner(),
        }).setAnyoneCanCall(
            codeAddress=code_address,
            sig=sig,
            can=can_call,
        ))
        assert authority.call().canCall(
            '0x0000000000000000000000000000000000000000',
            codeAddress=code_address,
            sig=sig,
        ) is can_call
    return _whitelist_call


@pytest.fixture()
def package_db(chain, authority):
    _package_db = chain.get_contract(
        'PackageDB',
        deploy_transaction={'from': authority.call().owner()},
    )
    chain.wait.for_receipt(_package_db.transact({
        'from': authority.call().owner(),
    }).setAuthority(authority.address))
    assert _package_db.call().authority() == authority.address
    return _package_db


@pytest.fixture()
def release_db(chain, authority):
    _release_db = chain.get_contract(
        'ReleaseDB',
        deploy_transaction={'from': authority.call().owner()},
    )
    chain.wait.for_receipt(_release_db.transact({
        'from': authority.call().owner(),
    }).setAuthority(authority.address))
    assert _release_db.call().authority() == authority.address
    return _release_db


@pytest.fixture()
def release_validator(chain, authority):
    _release_validator = chain.get_contract(
        'ReleaseValidator',
        deploy_transaction={'from': authority.call().owner()},
    )
    return _release_validator


@pytest.fixture()
def package_index(chain,
                  authority,
                  release_db,
                  package_db,
                  release_validator,
                  authorize_call,
                  whitelist_call):
    _package_index = chain.get_contract(
        'PackageIndex',
        deploy_transaction={'from': authority.call().owner()},
    )
    chain.wait.for_receipt(_package_index.transact({
        'from': authority.call().owner(),
    }).setAuthority(authority.address))
    assert _package_index.call().authority() == authority.address

    chain.wait.for_receipt(_package_index.transact({
        'from': authority.call().owner(),
    }).setPackageDb(package_db.address))
    assert _package_index.call().packageDb() == package_db.address

    chain.wait.for_receipt(_package_index.transact({
        'from': authority.call().owner(),
    }).setReleaseDb(release_db.address))
    assert _package_index.call().releaseDb() == release_db.address

    chain.wait.for_receipt(_package_index.transact({
        'from': authority.call().owner(),
    }).setReleaseValidator(release_validator.address))
    assert _package_index.call().releaseValidator() == release_validator.address

    # Release DB
    authorize_call(
        _package_index.address,
        release_db.address,
        "setRelease(bytes32,bytes32,string)",
        True,
    )
    whitelist_call(
        release_db.address,
        "setVersion(uint32,uint32,uint32,string,string)",
        True,
    )
    whitelist_call(
        release_db.address,
        "updateLatestTree(bytes32)",
        True,
    )

    # Package DB
    authorize_call(
        _package_index.address,
        package_db.address,
        "setPackage(string)",
        True,
    )
    authorize_call(
        _package_index.address,
        package_db.address,
        "setPackageOwner(bytes32,address)",
        True,
    )

    # Package Index
    whitelist_call(
        _package_index.address,
        "release(string,uint32,uint32,uint32,string,string,string)",
        True,
    )
    whitelist_call(
        _package_index.address,
        "transferPackageOwner(string,address)",
        True,
    )

    return _package_index


@pytest.fixture()
def package_owner(web3):
    return web3.eth.accounts[1]


@pytest.fixture()
def test_package(chain, package_index, package_owner):
    package_name = 'test-package'

    chain.wait.for_receipt(package_index.transact({
        'from': package_owner,
    }).release(
        name=package_name,
        major=1,
        minor=2,
        patch=3,
        preRelease='',
        build='',
        releaseLockfileURI='ipfs://not-a-real-uri',
    ))

    assert package_index.call().getPackageData(package_name)[0] == package_owner

    return package_name


@pytest.fixture()
def topics_to_abi(project):
    from web3.utils.abi import (
        filter_by_type,
        event_abi_to_log_topic,
    )
    all_events_abi = filter_by_type('event', itertools.chain.from_iterable(
        contract['abi'] for contract in project.compiled_contracts.values()
    ))
    _topic_to_abi = {
        event_abi_to_log_topic(abi): abi
        for abi in all_events_abi
    }
    return _topic_to_abi


@pytest.fixture()
def get_all_event_data(topics_to_abi):
    from web3.utils.events import (
        get_event_data,
    )

    def _get_all_event_data(log_entries):
        all_event_data = [
            get_event_data(topics_to_abi[log_entry['topics'][0]], log_entry)
            for log_entry in log_entries
            if log_entry['topics'] and log_entry['topics'][0] in topics_to_abi
        ]
        return all_event_data
    return _get_all_event_data


@pytest.fixture()
def extract_event_logs(chain, web3, get_all_event_data):
    def _extract_event_logs(event_name, contract, txn_hash, return_single=True):
        txn_receipt = chain.wait.for_receipt(txn_hash)
        filter = contract.pastEvents(event_name, {
            'fromBlock': txn_receipt['blockNumber'],
            'toBlock': txn_receipt['blockNumber'],
        })
        log_entries = filter.get()

        if len(log_entries) == 0:
            all_event_logs = get_all_event_data(txn_receipt['logs'])
            if all_event_logs:
                raise AssertionError(
                    "Something went wrong.  The following events were found in"
                    "the logs for the given transaction hash:\n"
                    "{0}".format('\n'.join([
                        event_log['event'] for event_log in all_event_logs
                    ]))
                )
            raise AssertionError(
                "Something went wrong.  No '{0}' log entries found".format(event_name)
            )
        if return_single:
            event_data = log_entries[0]
            return event_data
        else:
            return log_entries
    return _extract_event_logs
