// import SpacePunksTokenABI from "./space_puncs_token.js"
import TestTokenABI from "./test_token.js"

window.userWalletAddress = null
const header = document.body.querySelector('header')
const connectWalletButton = document.getElementById('connectWalletBtn')
const checkIn = document.getElementById('checkIn')
const statusBlock = document.querySelector('div[id=statusBlock]')
const userWallet = document.body.querySelector('a[id=userWallet]')
// const chainId = document.getElementById('chainId')
const flashMessage = document.querySelector('h1[id=flashMessage]')
const nftContractAddress = document.querySelector('a[id=nftContractAddress]')
const productSection = document.querySelector('section[id=product]')
const nftImage = document.querySelector('img[id=nftImage]')

const RINKEBY_CHAIN_ID = 4;
const NFT_CONTRACT_ADDRESS = '0x21a932c8e5eac252be0a0860b18c4edb8ee66034';
const TEST_TOKEN_ABI = TestTokenABI;
const ETHERSCAN_ADDRESS_PREFIX_URL = 'https://rinkeby.etherscan.io/address/'

function init() {
    userWallet.innerText = ''
    userWallet.href = '!#'

    header.hidden = false;
    connectWalletButton.hidden = false;
    checkIn.hidden = true;

    statusBlock.hidden = !header.hidden;
    productSection.hidden = !header.hidden;

    nftContractAddress.innerText = NFT_CONTRACT_ADDRESS.toUpperCase();
    nftContractAddress.href = `${ETHERSCAN_ADDRESS_PREFIX_URL}${NFT_CONTRACT_ADDRESS}`;

    checkIn.addEventListener('click', checkAccess);
}

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

    connectWalletButton.hidden = true;
    checkIn.hidden = false;

    window.chainId = Number(await window.ethereum.request({ method: 'eth_chainId' }))
    
    userWallet.innerText = `0x${window.userWalletAddress.toLowerCase().split('0x').pop().toUpperCase()}`
    userWallet.href = `${ETHERSCAN_ADDRESS_PREFIX_URL}${window.userWalletAddress}`
}

async function isNftInWallet(walletAddress) {
    let status = false;

    web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(TEST_TOKEN_ABI, NFT_CONTRACT_ADDRESS);
    const tokenId = 2;
    console.log(contract.methods);
    const balance = await contract.methods.balanceOf(walletAddress, tokenId).call();
    console.log(`NFT in wallet: ${balance}`);

    status = balance != 0;

    return status;
}

async function checkAccess() {
    if (window.chainId != RINKEBY_CHAIN_ID) {
        flashMessage.innerText = `Please switch network to Rinkeby (current chainId is ${window.chainId})`
    } else {
        if (await isNftInWallet(window.userWalletAddress)) {
            flashMessage.innerText = 'You have NFT pass. You are so awesome!';
            // await displayNft(window.userWalletAddress);
        } else {
            flashMessage.innerText = 'Still have no NFT pass?'
            productSection.hidden = false;
            nftImage.src = await getNftImageUrl(window.userWalletAddress);
        }
    }

    header.hidden = true;
    statusBlock.hidden = false;
}

async function getNftImageUrl(walletAddress) {
    web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(TEST_TOKEN_ABI, NFT_CONTRACT_ADDRESS);
    const tokenId = 1;
    // ERC1155
    // @param _owner  The address of the token holder
    // @param _id     ID of the Token
    // function balanceOf(address _owner, uint256 _id) external view returns (uint256)
    const balance = await contract.methods.balanceOf(walletAddress, tokenId).call();
    console.log(`NFT in wallet: ${balance}`);

    // Let's display it
    let tokenMetadataURI = await contract.methods.uri(tokenId).call();    

    if (tokenMetadataURI.startsWith('ipfs://')) {
        tokenMetadataURI = `https://ipfs.io/${tokenMetadataURI.split('ipfs://')[1]}`;
    }

    const tokenMetadata = await fetch(tokenMetadataURI).then((response) => response.json());
    
    let imageUrl = tokenMetadata['image'];
    if (imageUrl.startsWith('ipfs://')) {
        imageUrl = `https://ipfs.io/${imageUrl.split('ipfs://')[1]}`;
    }

    return imageUrl;
}

async function displayNft(walletAddress) {
    let imageUrl = await getNftImageUrl(walletAddress);

    const nftElement = document.getElementById('nft_template').content.cloneNode(true);
    nftElement.querySelector('h1').innerText = tokenMetadata['name'];
    nftElement.querySelector('a').href = tokenMetadata['external_url'];
    nftElement.querySelector('img').src = imageUrl;
    nftElement.querySelector('img').alt = tokenMetadata['description'];

    document.getElementById('nfts').append(nftElement);
}

window.addEventListener('DOMContentLoaded', () => {
    init();
    toggleButton();
});