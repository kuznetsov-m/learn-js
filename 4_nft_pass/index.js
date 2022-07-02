// import SpacePunksTokenABI from "./space_puncs_token.js"
import TestTokenABI from "./test_token.js"

window.userWalletAddress = null
const connectWalletButton = document.getElementById('connectWalletBtn')
const userWallet = document.getElementById('userWallet')
const chainId = document.getElementById('chainId')
const flashMessage = document.getElementById('flashMessage')

const RINKEBY_CHAIN_ID = 4;
const NFT_CONTRACT_ADDRESS = '0x21a932c8e5eac252be0a0860b18c4edb8ee66034';
const TEST_TOKEN_ABI = TestTokenABI;

function toggleButton() {
    if (!window.ethereum) {
        connectWalletButton.innerText = 'MetaMask is not installed'
        return false
    }

    connectWalletButton.addEventListener('click', loginWithMetaMask)
}

async function loginWithMetaMask() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        .catch((e) => {
        console.error(e.message)
        return
        })
    if (!accounts) { return }
    window.userWalletAddress = accounts[0]

    window.chainId = Number(await window.ethereum.request({ method: 'eth_chainId' }))
    
    userWallet.innerText = window.userWalletAddress
    chainId.innerText = window.chainId
    connectWalletButton.innerText = 'Sign out of MetaMask'

    connectWalletButton.removeEventListener('click', loginWithMetaMask)
    setTimeout(() => {
        connectWalletButton.addEventListener('click', signOutOfMetaMask)
    }, 200)

    if (window.chainId != RINKEBY_CHAIN_ID) {
        flashMessage.innerText = `Please change network to Rinkeby (current chainId is ${window.chainId})`
    } else {
        if (await isNftInWallet(window.userWalletAddress)) {
            flashMessage.innerText = 'You are member of NFT private club';
            await displayNft(window.userWalletAddress);
        } else {
            flashMessage.innerText = 'You heve no our private club NFT. You can get NFT here (link)'
        }
    }
}

function signOutOfMetaMask() {
    window.userWalletAddress = null
    userWallet.innerText = ''
    chainId.innerText = ''
    flashMessage.innerText = ''
    connectWalletButton.innerText = 'Sign in with MetaMask'

    connectWalletButton.removeEventListener('click', signOutOfMetaMask)
    setTimeout(() => {
        connectWalletButton.addEventListener('click', loginWithMetaMask)
    }, 200)
}

async function isNftInWallet(walletAddress) {
    let status = false;

    web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(TEST_TOKEN_ABI, NFT_CONTRACT_ADDRESS);
    const tokenId = 1;
    const balance = await contract.methods.balanceOf(walletAddress, tokenId).call();
    console.log(`NFT in wallet: ${balance}`);

    status = balance !== 0;

    return status;
}

async function displayNft(walletAddress) {
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

    const nftElement = document.getElementById('nft_template').content.cloneNode(true);
    nftElement.querySelector('h1').innerText = tokenMetadata['name'];
    nftElement.querySelector('a').href = tokenMetadata['external_url'];
    nftElement.querySelector('img').src = imageUrl;
    nftElement.querySelector('img').alt = tokenMetadata['description'];

    document.getElementById('nfts').append(nftElement);
}

window.addEventListener('DOMContentLoaded', () => {
    toggleButton()
});