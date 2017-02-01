import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import BSCard from '../bootstrap/BSCard'
import FAIcon from '../common/FAIcon'
import docco from 'react-syntax-highlighter/dist/styles/docco'; 
import SyntaxHighlighter from "react-syntax-highlighter/dist/light"

function mapStateToProps(state) {
  return {}
}

let CODE_BLOCK_1 = `PackageIndex index = PackageIndex(0x8011df4830b4f696cd81393997e5371b93338878);
bool exists = index.packageExists("owned");`

let CODE_BLOCK_2 = `PackageIndex index = PackageIndex(0x8011df4830b4f696cd81393997e5371b93338878);

// First get the unique hashed identifiers of each release
bytes32[] memory releaseHashes = index.getAllPackageReleaseHashes("owned");

// Next, loop through getting the data for each release.
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
}`

let CODE_BLOCK_3 = `PackageIndex index = PackageIndex(0x8011df4830b4f696cd81393997e5371b93338878);

string lockfileURI = index.getReleaseLockfileURI("owned", 1, 0, 0, "alpha1", "solc0.4.8");`


export default connect(mapStateToProps)(React.createClass({
  render() {
    return (
      <div id="documentation-integration-guide">
        <div className='container'>
          <div className='row'>
            <div className='col-sm-12'>
              <h1>Integrating your tool with the Ethereum Package Registry</h1>
              <p>Integrating your tool with the Etheruem Package Registry is easy, and is simply a matter of calling specific functions on the PackageIndex contract deployed to ropsten.</p>

              <p>The most important things any tool or package manager needs to know are the following:</p>

              <ul>
                <li>Does the package with name name exist?</li>
                <li>What versions of a package are available?</li>
                <li>What is the lockfile URI for a specific version of my package?</li>
              </ul>

              <p>We'll describe all these in detail below.</p>
              <h2>Determining if a Package exists in the Registry</h2>
              <p>To determine if a package already exists in the Registry, you need only call the <code>packageExists()</code> function on the <code>PackageIndex</code> contract. In Solidity, checking for the existence of the owned package might look like this:</p>
              <SyntaxHighlighter language='javascript' style={docco}>{CODE_BLOCK_1}</SyntaxHighlighter>
              <h2>Determining available versions of a package</h2>
              <p>Determining all available versions of a package is slightly harder than determining package existence. It requires the use of two functions on the <code>PackageIndex</code> contract, namely <code>getAllPackageReleaseHashes</code> and <code>getReleaseData</code>. Let's take a look at this in a Solidity example:</p>
              <SyntaxHighlighter language='javascript' style={docco}>{CODE_BLOCK_2}</SyntaxHighlighter>
              <p>This gives you a wealth of information, including all version information with pre-release and build information, if specified, as well as the lockfile URI, when the package was created and when it was last updated.</p>
              <h2>Determining the lockfile URI for a specific version</h2>
              <p>Getting a specific version of the package is slightly different than the above, in that you already know the version you're looking for so there's no need to loop through all available versions. In this case, you can get the lockfile directly via the <code>getReleaseLockfileURI</code> function on the <code>PackageIndex</code> contract. For the example below, let's try getting the lockfile of the owned package at version <code>1.0.0-alpha1+solc0.4.8</code>.</p>
              <SyntaxHighlighter language='javascript' style={docco}>{CODE_BLOCK_3}</SyntaxHighlighter>
              <p>And that should be enough to get you started! There are many more functions available, but don't hesitate to contact Piper or Tim with questions.</p>

            </div>
          </div>
        </div>
      </div>
    )
  },
}))
