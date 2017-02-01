# An Etherum Smart Contract Package Index


## Smart Contracts

The smart contracts in this repository are tested using the `populus`
development framework.  Installation instructions for populus can be found in
the [Populus Documentation](http://populus.readthedocs.io/en/latest/quickstart.html)

With populus installed you can run the tests using the following command:

```bash
$ py.test tests/
```

### Package Index Contract

The primary contract in this repository is the **PackageIndex** which can be
found in [`./contracts/PackageIndex.sol`](./contracts/PackageIndex.sol).

The deployed instance of the Package Index can be found on the Ropsten testnet @ 
[`0x8011df4830b4f696cd81393997e5371b93338878`](https://testnet.etherscan.io/address/0x8011df4830b4f696cd81393997e5371b93338878)

The full build assets including ABIs for all contracts can be found in
[`./build-assets/contract-build-assets.json`](./build-assets/contract-build-assets.json).

## Integrating your tool with the Ethereum Package Index

Integrating your tool with the Etheruem Package Index is easy, and is simply a matter of calling specific functions on the PackageIndex contract deployed to ropsten.

The most important things any tool or package manager needs to know are the following:

* Does the package with name `name` exist? 
* What versions of a package are available?
* What is the lockfile URI for a specific version of my package?

We'll describe all these in detail below.

### Determining if a Package exists in the Registry

To determine if a package already exists in the Registry, you need only call the `packageExists()` function on the `PackageIndex` contract. In Solidity, checking for the existence of the `owned` package might look like this:

```
PackageIndex index = PackageIndex(0x8011df4830b4f696cd81393997e5371b93338878);
bool exists = index.packageExists("owned");
```

### Determining available versions of a package

Determining all available versions of a package is slightly harder than determining package existence. It requires the use of two functions on the `PackageIndex` contract, namely `getAllPackageReleaseHashes` and `getReleaseData`. Let's take a look at this in a Solidity example:

```
PackageIndex index = PackageIndex(0x8011df4830b4f696cd81393997e5371b93338878);

// First get the unique hashed identifiers of each release
bytes32[] memory releaseHashes = index.getAllPackageReleaseHashes("owned");

// Next, loop through getting the data.
for (uint i = 0; i < releaseHashes.length; i++) {
    bytes32 hash = releaseHashes[i];

    // Set up variables that describe the release.
    uint32 major;
    uint32 minor;
    uint32 patch;
    string preRelease;
    string build;
    string releaseLockfileURI;
    uint createdAt;
    uint updatedAt;
    
    (major, minor, patch, preRelease, build, releaseLockfileURI, createdAt, updatedAt) = index.getReleaseData(hash);
}
```

This gives you a wealth of information, including all version information with pre-release and build information, if specified, as well as the lockfile URI, when the package was created and when it was last updated.

### Determining the lockfile URI for a specific version

Getting a specific version of the package is slightly different than the above, in that you already know the version you're looking for so there's no need to loop through all available versions. In this case, you can get the lockfile directly via the `getReleaseLockfileURI` function on the `PackageIndex` contract. For the example below, let's try getting the lockfile of the `owned` package at version `1.0.0-alpha1+solc0.4.8`.

```
PackageIndex index = PackageIndex(0x8011df4830b4f696cd81393997e5371b93338878);

string lockfileURI = index.getReleaseLockfileURI("owned", 1, 0, 0, "alpha1", "solc0.4.8");
```

And that should be enough to get you started! There are many more functions available, but don't hesitate to contact Piper or Tim with questions.

## Web Site (ethpm.com)

To start hacking on the web site first install all of the web dependencies.

```bash
$ yarn
```

Then, to build the web assets.

```bash
$ webpack -w
```

And then to run the webserver

```bash
$ yarn run web
```

You should now be able to browse and view the app @ `localhost:8080`.


### Structure and Architecture

The site is build using React and Redux.  

The `./www-src` folder is the root directory for all of the source files used
to build the web application.

- The main entry point for the web application can be found in `./www-src/js/index.jsx`.  
- The React/Redux app can be found in `./www-src/js/components/App.jsx`.

File Layout

- `./www-src/contracts/`: holds the contract ABIs used by the app.
- `./www-src/js/`: root directory for all js files.
- `./www-src/js/actions`: Actions for the redux app.
- `./www-src/js/reducers`: Reducers for the redux app.
- `./www-src/js/middlewares`: Middlewares for the redux app.
- `./www-src/js/services`: Services is where anything that actually makes http requests or other types of requests goes.  This keeps this type of code out of the main application.
- `./www-src/js/components`: Root directory for all of the React components.
- `./www-src/js/components/common`: Components which are generic
- `./www-src/js/components/bootstrap`: Components which implement something from Bootstrap
- `./www-src/js/components/layout`: A Component which is used as as a page layout.
- `./www-src/js/components/pages`: A Component which is used as one of the pages.

General development guidelines.

- Aggressively avoid mutation.  Reducers should be using ImmutableJS objects.
- Terminology:
    - Services use `getX`
    - Actions use `loadX` and `setX`
- Actions should use functions from a service to make any kind of HTTP request.
- Components should be givien the absolute minimum necessary state through their respective `mapStateToProps` functions.
