import contractAbi from "./contract_abi.js"

const CONTRACT_ADDRESS = '0x481297d57a541F3fe0F345eCE2F71847096Ad435';
const CONTRACT_ABI = contractAbi;

const userWallet = document.body.querySelector('span[id=userWallet]')
const connectWalletButton = document.getElementById('connectWalletBtn')
const contractAddressLabel = document.getElementById('contractAddress')

let canvas = document.getElementById("pixel_canvas");
let height = 3;
let width = 3;
let color = document.getElementById("colorPicker");
color.setAttribute('value', '#37374f');

function toggleButton() {
    if (!window.ethereum) {
        connectWalletButton.innerText = 'Install MetaMask wallet';
        connectWalletButton.href = 'https://metamask.io/';
        return false;
    }
    connectWalletButton.innerText = 'Connect Wallet';
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

    const loginHandler = async () => {
        window.chainId = Number(await window.ethereum.request({ method: 'eth_chainId' }))
        
        userWallet.innerText = `0x${window.userWalletAddress.toLowerCase().split('0x').pop().toUpperCase()}`
        
        await fillGrid();
    }

    await loginHandler();
}

// color.addEventListener("change", () => {console.log('color changed!')}, false);

function makeGrid() {
    for (let r = 0; r < height; r++) {
        const row = canvas.insertRow(r);
        for (let c = 0; c < width; c++) {
            const cell = row.insertCell(c);
            cell.addEventListener("click", () => {fillSquare(r, c, color.value, true)});
            // cell.addEventListener("click", () => {console.log('clicked!')});
        }
    }
}

function clearGrid() {
    while (canvas.firstChild) {
        canvas.removeChild(canvas.firstChild);
    }
}

function fillGridRandom() {
    const colors = ['red', 'blue', 'black', 'yellow', 'indigo']
    const color = colors[Math.floor(Math.random() * colors.length)];

    for (let r = 0; r < canvas.rows.length; r++) {
        const row = canvas.rows[r];
        for (let c = 0; c < row.cells.length; c++) {
            row.cells[c].setAttribute("style", `background-color: ${color}`);
        }
    }
}

async function readStorage() {
    web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    let colorsStorage = [];

    for (let r = 0; r < canvas.rows.length; r++) {
        const row = canvas.rows[r];
        let rowColors = []
        for (let c = 0; c < row.cells.length; c++) {
            const color = await contract.methods.colorsStorage(r, c).call(
                {from: String(window.userWalletAddress)}
            );
            rowColors.push(color);
        }
        colorsStorage.push(rowColors);
    }
    
    return colorsStorage;
}

async function fillGrid() {
    const colorsStorage = await readStorage();

    for (let r = 0; r < canvas.rows.length; r++) {
        const row = canvas.rows[r];
        for (let c = 0; c < row.cells.length; c++) {
            const color = `#${colorsStorage[r][c].slice(2)}`;
            row.cells[c].setAttribute("style", `background-color: ${color}`);
        }
    }
}

async function fillSquare(row, column, _color, needSendTx = false) {
    const fill = () => {
        const tbody = document.body.querySelector('tbody');
        let td = tbody.querySelectorAll('tr')[row].querySelectorAll('td')[column];
        td.setAttribute("style", `background-color: ${_color}`);
    }
    if (needSendTx) {
        const sendTx = async () => {
            web3 = new Web3(window.ethereum);
            const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        
            const r = await contract.methods.writeColor(row, column, `0x${_color.slice(1)}`).send(
                {from: String(window.userWalletAddress)},
                (err, txHash) => {
                    if (!err) {fill();}
                    console.log(txHash);
                }
            );
            console.log(r);
        }
    
        await sendTx();
    } else {
        fill();
    }
}

function init() {
    let a = document.createElement('a');
    a.setAttribute('href', `https://kovan.etherscan.io/address/${CONTRACT_ADDRESS}`);
    a.appendChild(document.createTextNode(CONTRACT_ADDRESS))
    contractAddressLabel.appendChild(a);

    toggleButton();
    makeGrid();
}

init();