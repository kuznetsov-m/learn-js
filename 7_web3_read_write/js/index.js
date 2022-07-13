import TestContractABI from "./test_contract.js"

const CONTRACT_ADDRESS = '0xf3223949c04ac27064ccac8d62bc0bdeb3b19977';
const CONTRACT_ABI = TestContractABI;

const userWallet = document.body.querySelector('span[id=userWallet]')
const connectWalletButton = document.getElementById('connectWalletBtn')
const contractAddressLabel = document.getElementById('contractAddress')
const callContractButton = document.getElementById('callContract')
const sendWriteDataTxBtn = document.getElementById('sendWriteDataTx')
const transactionsContainer = document.body.querySelector('div[id=transactionsContainer]')

function toggleButton() {
    if (!window.ethereum) {
        connectWalletButton.innerText = 'Install MetaMask wallet';
        connectWalletButton.href = 'https://metamask.io/';
        return false;
    }
    connectWalletButton.innerText = 'Connect MetaMask Wallet';
    connectWalletButton.href = '#!';

    connectWalletButton.addEventListener('click', loginWithMetaMask)
}

async function loginWithMetaMask(event) {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        .catch((e) => {
        console.error(e.message)
        return
    })
    if (!accounts) { return }
    window.userWalletAddress = accounts[0]

    window.chainId = Number(await window.ethereum.request({ method: 'eth_chainId' }))
    
    userWallet.innerText = `0x${window.userWalletAddress.toLowerCase().split('0x').pop().toUpperCase()}`
}

async function readCall() {
    web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    const returnData = await contract.methods.readData().call(
        {from: String(window.userWalletAddress)}
    );

    transactionsContainer.appendTx('readDate', undefined, returnData);
}

async function writeDataTransaction() {
    web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    const data = document.getElementById('writeDataInput').value;
    console.log(await contract.methods.writeData(data).send(
        {from: String(window.userWalletAddress)},
        (error, txHash) => {transactionsContainer.appendTx('writeData', data, undefined, error, txHash)}
    ));
}

function init() {
    contractAddressLabel.innerText = CONTRACT_ADDRESS;
    callContractButton.addEventListener('click', readCall);
    sendWriteDataTxBtn.addEventListener('click', writeDataTransaction);
    
    transactionsContainer.appendTx = (methodName, data, returnData, error, txHash) => {
        let p = document.createElement('p');
        const errorTxHash = (error || txHash) ? `(error: ${error} txHash: ${txHash})` : ''
        p.appendChild(document.createTextNode(
            `${methodName}(${data ? `(${data})` : ''}): ` +
            (returnData ? `${returnData} ` : '') +
            errorTxHash
        ));
        transactionsContainer.appendChild(p);
    }
}

async function test() {
    // await loginWithMetaMask();
    // await readCall();
    // await writeDataTransaction();
}

window.addEventListener('DOMContentLoaded', () => {
    init();
    toggleButton();

    test();
});