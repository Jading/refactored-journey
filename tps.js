// const moment = require('moment');
// const fs = require('fs');

const MockProxyRegistry = artifacts.require(
    "../contracts/MockProxyRegistry.sol"
);
const BoraMetaToken = artifacts.require(
    "./BoraMetaToken.sol"
);

const gasPrice = web3.utils.toWei("1", 'gwei');
const usd = 2731;
let deposit, boraMetaToken;
let trx, trx2, gasUsed, gasUsed2, result, trxReceipt;

const pad = function (n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

const getTransaction = async (type, transactionHash) => {
    trx = await web3.eth.getTransaction(transactionHash);
    trxReceipt = await web3.eth.getTransactionReceipt(transactionHash);
    gasUsed = trxReceipt.gasUsed * trx.gasPrice;
    result = {
        'type             ': type,
        'gasUsed       ': trxReceipt.gasUsed,
        'gasPrice': web3.utils.fromWei(web3.utils.toBN(trx.gasPrice), 'gwei'),
        '1ETH*USD': usd,
        'gasUsed*gasPrice(Ether)': web3.utils.fromWei(web3.utils.toBN(gasUsed), 'ether'),
        'gasUsed*gasPrice(USD)': web3.utils.fromWei(web3.utils.toBN(gasUsed), 'ether') * usd,
    }
    return result;
}

const formatArray = function (array) {
    return array.join("\t\t")
}

const reportTest = async function (participants, accounts) {
    const addresses = [];
    const transactions = [];
    const encrypted_codes = [];
    const owner = accounts[0];
    const userA = accounts[1];
    const proxyForOwner = owner;

    proxy = await MockProxyRegistry.new();
    await proxy.setProxy(userA, proxyForOwner);
    boraMetaToken = await BoraMetaToken.new(proxy.address, { gasPrice: gasPrice });

    transactions.push(await getTransaction('contract creation', boraMetaToken.transactionHash))

    for (var i = 0; i < participants; i++) {
        const result = await boraMetaToken
            // .mint(owner, i+1)
            .mint(owner, { from: owner });
        if (i == 0) {
            transactions.push(await getTransaction('mint', result.tx))
        }
        // addresses.push(accounts[i]);
    }

    var header = Object.keys(transactions[0]).join("\t");
    var bodies = [header]
    console.log(header)

    for (var i = 0; i < transactions.length; i++) {
        var row = formatArray(Object.values(transactions[i]));
        console.log(row);
        bodies.push(row);
    }
    //   var date = moment().format("YYYYMMDD");
    //   fs.writeFileSync(`./log/stress_${pad(participants, 4)}.log`, bodies.join('\n') + '\n');
    //   fs.writeFileSync(`./log/stress_${pad(participants, 4)}_${date}.log`, bodies.join('\n') + '\n');
}

contract('Stress test', function (accounts) {
    describe('stress test', function () {
        it('can handle 2 participants', async function () {
            await reportTest(2, accounts)
        })

        it('can handle 20 participants', async function () {
            await reportTest(20, accounts)
        })

        // it('can handle 100 participants', async function () {
        //     await reportTest(100, accounts)
        // })

        // it('can handle 200 participants', async function () {
        //     await reportTest(200, accounts)
        // })

        // it('can handle 300 participants', async function () {
        //     await reportTest(300, accounts)
        // })
    })
})