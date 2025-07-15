const ROUTER_ABI = require('./abies/ROUTER.json');
const FACTORY_ABI = require('./abies/FECTORY.json');
const PAIR_ABI = require('./abies/PAIR.json');
const WETH_ABI = require('./abies/WETH.json');
module.exports.ABIS = {
    ROUTER: ROUTER_ABI,
    FACTORY: FACTORY_ABI,
    PAIR: PAIR_ABI,
    WETH: WETH_ABI
}

module.exports.CONTRACTS = {
    ROUTER: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    FACTORY: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
}