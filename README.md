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


## Web

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
