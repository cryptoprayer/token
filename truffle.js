// Allows us to use ES6 in our migrations and tests.
require('babel-register')({
  ignore: /node_modules\/(?!zeppelin-solidity)/
});
require('babel-polyfill');

module.exports = {
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id,
    },
    ropsten:  {
      network_id: 3,
      host: "localhost",
      port:  8545,
      gasPrice: 2000000000,
      gas:   4000000,
      from: '0xBb14e7dDDcEb3d09899B39bD3098e1EABaF5AA17'
    }
  }
};

