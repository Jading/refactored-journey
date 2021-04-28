rm -rf flattened
mkdir flattened
./node_modules/.bin/truffle-flattener contracts/BoraMetaToken.sol > flattened/BoraMetaToken.sol