import pytest


@pytest.fixture(autouse=True)
def release_db_perms(chain, web3, release_db, authorize_call, whitelist_call):
    authorize_call(
        web3.eth.coinbase,
        release_db.address,
        "setRelease(bytes32,bytes32,string)",
        True,
    )
    authorize_call(
        web3.eth.coinbase,
        release_db.address,
        "removeRelease(bytes32,string)",
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
