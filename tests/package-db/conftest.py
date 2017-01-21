import pytest


@pytest.fixture(autouse=True)
def package_db_perms(chain, web3, package_db, authorize_call):
    authorize_call(
        web3.eth.coinbase,
        package_db.address,
        "setRelease(string,uint32,uint32,uint32,string,string,string)",
        True,
    )
    authorize_call(
        web3.eth.coinbase,
        package_db.address,
        "setPackageOwner(bytes32,address)",
        True,
    )
    authorize_call(
        web3.eth.coinbase,
        package_db.address,
        "setVersion(uint32,uint32,uint32,string,string)",
        True,
    )
