require("@nomiclabs/hardhat-waffle");
module.exports = {
  solidity: "0.8.0",
  networks: {
    rinkeby: {
      url: "https://dark-alpha-breeze.rinkeby.discover.quiknode.pro/4b4bd6115dccc8046eb2ccfa7a5fc98336785f87/",
      accounts: ["0c715cf437ff08b40aef2ddaa0433300b2b50b38052c866185597be21a336694"],
    },
  },
};

