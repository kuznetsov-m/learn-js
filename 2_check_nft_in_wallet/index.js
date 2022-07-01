import SpacePunksTokenABI from "./space_puncs_token.js"
import TextTockenABI from "./test_token.js"

document.addEventListener('DOMContentLoaded', () => {
    web3 = new Web3(window.ethereum);

    document.getElementById('getNftBalanceOnWallet').addEventListener('click', async () => {
        // NFT Contract address
        const address = '0x45db714f24f5a313569c41683047f1d49e78ba07';
        const jsonInterface = SpacePunksTokenABI;
        const contract = new web3.eth.Contract(jsonInterface, address);
        // User Wallet address
        // const walletAddress = '0xc7116D7AbF08e200FA379F51053f0C3A160d8367';
        const walletAddress = '0xeDAB98246664996F21564Af3240bF5BaC0f3c7E1';
        contract.defaultAccount = walletAddress;
        const spacePunksBalance = await contract.methods.balanceOf(walletAddress).call();
        console.log(`NFT in wallet: ${spacePunksBalance}`);

        // Let's display it
        for (let i = 0; i < spacePunksBalance; ++i) {
            const tokenId = await contract.methods.tokenOfOwnerByIndex(walletAddress, i).call();
            let tokenMetadataURI = await contract.methods.tokenURI(tokenId).call();
            // ipfs://QmVbg8tDifQfUTjB11tbSGsk93vXboPuV73ogLBf6MSJ7p/9270.json
            // console.log(tokenMetadataURI); 
            
            if (tokenMetadataURI.startsWith('ipfs://')) {
                tokenMetadataURI = `https://ipfs.io/ipfs/${tokenMetadataURI.split('ipfs://')[1]}`;
            }
            // https://ipfs.io/ipfs/QmVbg8tDifQfUTjB11tbSGsk93vXboPuV73ogLBf6MSJ7p/9270.json
            // console.log(tokenMetadataURI);

            const tokenMetadata = await fetch(tokenMetadataURI).then((response) => response.json());
            console.log(tokenMetadata);
            console.log(tokenMetadata['image']);

            const spacePunksTokenElement = document.getElementById('nft_template').content.cloneNode(true);
            spacePunksTokenElement.querySelector('h1').innerText = tokenMetadata['name'];
            spacePunksTokenElement.querySelector('a').href = `https://opensea.io/assets/${address}/${tokenId}`;
            spacePunksTokenElement.querySelector('img').src = tokenMetadata['image'];
            spacePunksTokenElement.querySelector('img').alt = tokenMetadata['description'];

            document.getElementById('nfts').append(spacePunksTokenElement);
        }
    })

    document.getElementById('getTestTokenNftBalanceOnWallet').addEventListener('click', async () => {
        // NFT Contract address
        const address = '0x21a932c8e5eac252be0a0860b18c4edb8ee66034';
        const jsonInterface = TextTockenABI;
        const contract = new web3.eth.Contract(jsonInterface, address);
        // User Wallet address
        const walletAddress = '0xc7116d7abf08e200fa379f51053f0c3a160d8367';
        contract.defaultAccount = walletAddress;
        const tokenId = 1;
        // ERC1155
        // @param _owner  The address of the token holder
        // @param _id     ID of the Token
        // function balanceOf(address _owner, uint256 _id) external view returns (uint256)
        const spacePunksBalance = await contract.methods.balanceOf(walletAddress, tokenId).call();
        console.log(`NFT in wallet: ${spacePunksBalance}`);

        // Let's display it
        // let tokenMetadataURI = await contract.methods.tokenURI(tokenId).call();
        let tokenMetadataURI = await contract.methods.uri(tokenId).call();
        // ipfs://ipfs/QmYkUxe73CXpPAPEMHT1VzQw7XQroapdKbfj6p5xY5voK3
        
        console.log(tokenMetadataURI)

        if (tokenMetadataURI.startsWith('ipfs://')) {
            tokenMetadataURI = `https://ipfs.io/${tokenMetadataURI.split('ipfs://')[1]}`;
        }
        console.log(tokenMetadataURI)

        const tokenMetadata = await fetch(tokenMetadataURI).then((response) => response.json());
        console.log(tokenMetadata);
        // ipfs://ipfs/QmW9Uen77EgBZfKV8QkCnfxuN4b5mvZ5n9deyyb35UyhZk/image.png
        // console.log(tokenMetadata['image']);
        
        let imageUrl = tokenMetadata['image'];
        if (imageUrl.startsWith('ipfs://')) {
            imageUrl = `https://ipfs.io/${imageUrl.split('ipfs://')[1]}`;
        }
        // https://ipfs.io/ipfs/QmW9Uen77EgBZfKV8QkCnfxuN4b5mvZ5n9deyyb35UyhZk/image.png
        console.log(imageUrl);

        const nftElement = document.getElementById('nft_template').content.cloneNode(true);
        nftElement.querySelector('h1').innerText = tokenMetadata['name'];
        nftElement.querySelector('a').href = tokenMetadata['external_url'];
        nftElement.querySelector('img').src = imageUrl;
        nftElement.querySelector('img').alt = tokenMetadata['description'];

        document.getElementById('nfts').append(nftElement);
    })
})