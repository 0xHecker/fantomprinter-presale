window.userAddress = null;

const MIM_CONTRACT_ADDRESS = "0x82f0B8B456c1A451378467398982d4834b6829c1";
const FPTR_CONTRACT_ADDRESS = "0xe39c2233A68561291Fbf597433d4a9A1D219Ddbe";
const PRESALE_CONTRACT_ADDRESS = "0xDa73D3695407e61D95A56C07A56AA4F80c53773C";
const PUBLICSALE_CONTRACT_ADDRESS = "0xc9C9eCE77cb39F0Ecd2ac028bF859dd08D596Fa0";
const OG_CONTRACT_ADDRESS = "0xdA471980c04eAC8c384c0AcA2E4C26ED07C0468f";
const BRIDGE_CONTRACT_ADDRESS = "0xFF916D034CA58212d4B643093A9DcfF8f83bd823";

const provider = new ethers.providers.Web3Provider(window.ethereum); //JsonRpcProvider('https://rpc.ftm.tools/')
window.onload = async() => {
    // Init Web3 connected to ETH network
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        loginWithEth();
    } else {
        alert("No ETH brower extension detected.");
    }
    // Load in Localstore key
    window.userAddress = window.localStorage.getItem("userAddress");
    showAddress();
};

// Use this function to turn a 42 character ETH address
// into an address like 0x345...12345
function truncateAddress(address) {
    if (!address) {
        return "";
    }
    return `${address.substr(0, 6)}...${address.substr(
    address.length - 5,
    address.length
  )}`;
}

// Display or remove the users know address on the frontend
function showAddress() {
    if (!window.userAddress) {
        document.getElementById("userAddress").innerText = "Connect With Metamask";
        document.getElementById("logoutButton").classList.add("hidden");
        document.getElementById("contractSymbol").classList.add("hidden");
        document.getElementById("userBalance").innerText = "";
        document.getElementById("showBalance").innerText = "";
        return false;
    }

    document.getElementById(
        "userAddress"
    ).innerText = `${truncateAddress(window.userAddress)}`;
    getEthBalance();
    getMimBalance();
}

window.ethereum.on('accountsChanged', function() {
    // Time to reload your interface with accounts[0]!
    console.log('accountsChanged');
    logout();
    changeChain();
})

let changeChain = async() => {
    let chainId = await window.web3.eth.net.getId();
    if (chainId == '0xfa') {
        console.log("Fantom Opera Chain");
        // Prompt to use all buttons and green

    } else {
        // Prompt to use disable buttons and red
        wrongChain();
        console.log("Not Fantom Opera Chain");
        logout();
        addChain();
        loginWithEth();
        await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xfa' }] });
    }
}

const wrongChain = function() {
    document.getElementById("userAddress").innerText = "Wrong Chain";
    document.getElementById("userAddress").classList.remove("contact");
    document.getElementById("userAddress").classList.add("contact-red");
}

const retriveChain = function() {
    loginWithEth();
}

window.ethereum.on('chainChanged', async function() {
    // Time to reload your interface with the new networkId\
    let chainId = await window.web3.eth.net.getId();
    if (chainId == '0x250') {
        console.log("Fantom Opera Chain");
        // Prompt to use all buttons and green
    } else {
        // Prompt to use disable buttons and red
        console.log("Not Fantom Opera Chain");
        changeChain();
        await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xfa' }] });
    }
})

let addChain = async function addNetwork() {

    let networkData;

    networkData = [{
        chainId: "0xfa",

        chainName: "Fantom Opera",

        rpcUrls: ["https://rpc.ftm.tools/"],

        nativeCurrency: {

            name: "Fantom",

            symbol: "FTM",

            decimals: 18,

        },
        blockExplorerUrls: ["https://ftmscan.com"],
    }, ];

    return window.ethereum.request({

        method: "wallet_addEthereumChain",

        params: networkData,

    });

}

function getEthBalance() {
    window.web3.eth.getBalance(window.userAddress, (err, res) => {
        if (err) {
            console.error(err);
        } else {
            document.getElementById("userBalance").innerText = `${web3.utils.fromWei(res, "ether").slice(0,8)} FTM`;
            // document.getElementById("userBalance2").innerText = `${web3.utils.fromWei(res, "ether").slice(0,6)} FTM`;
        }
    });
}

async function getMimBalance() {
    const abiJson = [
        { "constant": true, "inputs": [{ "name": "who", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
    ];

    const contract = new web3.eth.Contract(abiJson, MIM_CONTRACT_ADDRESS);
    const balance = await contract.methods.balanceOf(window.userAddress).call();

    // document.getElementById("mimBalance").innerText = ` ${web3.utils.fromWei(balance, "ether").slice(0,7)} MIM`;
}

// remove stored user address and reset frontend
function logout() {
    window.userAddress = null;
    window.localStorage.removeItem("userAddress");
    document.getElementById("userAddress").innerText = "Connect With Metamask";
    document.getElementById("userBalance").innerText = "FTM: NA";
    document.getElementById("logoutButton").classList.remove("contact-red");
    document.getElementById("logoutButton").innerText = '';
    document.getElementById("logoutButton").classList.add("hidden");
    // document.getElementById("wltext").innerText = "";
    // document.getElementById("wltext").classList.remove("contact-red");
    // document.getElementById("wltext").classList.remove("contact-green");
    document.getElementById("claimable").innerText = `NaN`;
    document.getElementById("userBalance2").innerText = `NaN`;
    document.getElementById("mimBalance").innerText = `NaN`;
    showAddress();
}

// Login with Web3 via Metamasks window.ethereum library
async function loginWithEth() {
    if (window.web3) {
        try {
            // We use this since ethereum.enable() is deprecated. This method is not
            // available in Web3JS - so we call it directly from metamasks' library
            const selectedAccount = await window.ethereum
                .request({
                    method: "eth_requestAccounts",
                })
                .then((accounts) => accounts[0])
                .catch(() => {
                    throw Error("No account selected!");
                });

            window.userAddress = selectedAccount;
            window.localStorage.setItem("userAddress", selectedAccount);
            addChain();
            changeChain();
            document.getElementById("userAddress").classList.remove("contact-red");
            document.getElementById("userAddress").classList.add("contact");
            document.getElementById("logoutButton").classList.add("contact-red");
            document.getElementById("logoutButton").innerText = "logout";
            showAddress();
            mimRaisedSoFar();
            getprePercentReleased();
            checkpFPTRBalance();
            checkFPTRBalance();
        } catch (error) {
            console.error(error);
        }
    } else {
        alert("No ETH brower extension detected.");
    }
}


const connectMetamaskButton = document.getElementById("userAddress");
connectMetamaskButton.addEventListener("click", loginWithEth);

const logoutBtn = document.getElementById("logoutButton");

logoutBtn.addEventListener("click", logout);

async function isWL() {
    const contract = new window.web3.eth.Contract(
        window.presaleABI,
        PRESALE_CONTRACT_ADDRESS
    );
    const isWl = await contract.methods.wl(window.userAddress).call({ from: window.userAddress });
    let wltext = document.getElementById("wltext");
    if (isWl) {
        wltext.innerText = "Congratulations, you are Whitelisted!! 🎉🎉";
        wltext.classList.add("wltext-green");
    } else {
        wltext.innerText = "Sorry, You are not eligible for private presale!";
        wltext.classList.add("wltext-red");
    }
}

// Go to blockchain and get the contract symbol. Keep in mind
// YOU MUST BE CONNECT TO RINKEBY NETWORK TO USE THIS FUNCTION
// why -> because this specific contract address is on ethereum.
// When you click login, just make sure your network is Rinkeby and it will all workout.
// async function getContractSymbol() {
//     document.getElementById("contractSymbol").classList.remove("hidden");

//     const contract = new window.web3.eth.Contract(
//         window.mimABI,
//         MIM_CONTRACT_ADDRESS
//     );

//     const symbol = await contract.methods.symbol().call({ from: window.userAddress });
//     const name = await contract.methods.name().call({ from: window.userAddress });
//     const balance = await contract.methods.
//     balanceOf(window.userAddress)
//         .call({ from: window.userAddress, account: window.userAddress });

//     document.getElementById("contractSymbol").innerText = `Symbol: ${symbol}, Name: ${name}, Contact address: ${MIM_CONTRACT_ADDRESS}  balance: ${balance}`;
//     document.getElementById("showBalance").innerText = `${symbol} balance: ${balance/1e09}`;
// }

// async function approveMIM() {
//     const contract = new window.web3.eth.Contract(
//         window.mimABI,
//         MIM_CONTRACT_ADDRESS
//     );
//     let approve = await contract.methods.approve(window.userAddress, 1000e09).send({ from: window.userAddress, gas: 3000000 });
//     console.log(approve);
// }

// async function approveContract() {

//     const contract = new window.web3.eth.Contract(
//         window.presaleABI,
//         PRESALE_CONTRACT_ADDRESS
//     );
//     let approve = await contract.methods.approve(PRESALE_CONTRACT_ADDRESS, 10000000e09).send({ from: window.userAddress, gas: 3500000 });
//     // let increaseAlnce = await contract.methods.increaseAllowance(PRESALE_CONTRACT_ADDRESS, 100000e09).send({ from: window.userAddress, gas: 3000000 });
//     console.log(approve);
// }

async function buy() {
    const contract = new window.web3.eth.Contract(
        window.publicsaleABI,
        PUBLICSALE_CONTRACT_ADDRESS
    );

    let amount = document.getElementById("quantity").value;
    contract.methods.buyFPTR(BigInt(amount * 1e18))
        .send({ from: window.userAddress })
        .then(receipt => { console.log(receipt) });
}

// The MIM token contract
const mimAbi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",

    // Get the account balance
    "function balanceOf(address) view returns (uint)",
    "function approve(address, uint) returns (bool)",
    // Send some of your tokens to someone else
    "function transfer(address to, uint amount)"
]
const signer = provider.getSigner();

const approveContractToUseMIM = async function() {
    let mimReadcontract = new ethers.Contract(MIM_CONTRACT_ADDRESS, mimAbi, provider);

    let mimWritecontract = new ethers.Contract(MIM_CONTRACT_ADDRESS, mimAbi, signer);
    await mimWritecontract.approve(
        PRESALE_CONTRACT_ADDRESS,
        BigInt(100000e18)
    )
}

const approveContract2ToUseMIM = async function() {
    let mimReadcontract = new ethers.Contract(MIM_CONTRACT_ADDRESS, mimAbi, provider);

    let mimWritecontract = new ethers.Contract(MIM_CONTRACT_ADDRESS, mimAbi, signer);
    // await mimWritecontract.approve(
    //     PUBLICSALE_CONTRACT_ADDRESS,
    //     BigInt(1000000e18)
    // )
}

// const approveContractToUsepreFptr = async function() {
//     let mimReadcontract = new ethers.Contract(FPTR_CONTRACT_ADDRESS, mimAbi, provider);

//     let mimWritecontract = new ethers.Contract(FPTR_CONTRACT_ADDRESS, mimAbi, signer);
//     await mimWritecontract.approve(
//         PRESALE_CONTRACT_ADDRESS,
//         BigInt(1000000e18)
//     )
// }

// const approveContractToUsepubFptr = async function() {
//     let mimReadcontract = new ethers.Contract(FPTR_CONTRACT_ADDRESS, mimAbi, provider);

//     let mimWritecontract = new ethers.Contract(FPTR_CONTRACT_ADDRESS, mimAbi, signer);
//     await mimWritecontract.approve(
//         PRESALE_CONTRACT_ADDRESS,
//         BigInt(1000000e18)
//     )
// }

document.getElementById("approvePreContract").addEventListener("click", async function(event) {
    event.preventDefault();
    let mimReadcontract = new ethers.Contract(FPTR_CONTRACT_ADDRESS, mimAbi, provider);

    let mimWritecontract = new ethers.Contract(FPTR_CONTRACT_ADDRESS, mimAbi, signer);
    await mimWritecontract.approve(
        PRESALE_CONTRACT_ADDRESS,
        BigInt(10000000e18)
    ).then(receipt => { console.log(receipt) });
});

document.getElementById("approvePubContract").addEventListener("click", async function(event) {
    event.preventDefault();
    let mimReadcontract = new ethers.Contract(FPTR_CONTRACT_ADDRESS, mimAbi, provider);

    let mimWritecontract = new ethers.Contract(FPTR_CONTRACT_ADDRESS, mimAbi, signer);
    await mimWritecontract.approve(
        PUBLICSALE_CONTRACT_ADDRESS,
        BigInt(10000000e18)
    ).then(receipt => { console.log(receipt) });
});

const claimPreFptrfromPresale = async function() {
    const contract = new window.web3.eth.Contract(
        window.presaleABI,
        PRESALE_CONTRACT_ADDRESS
    );

    contract.methods.redeemFPTR()
        .send({ from: window.userAddress })
        .then(receipt => { console.log(receipt) });
}



const claimPreFptrfromPublicsale = async function() {
    const contract = new window.web3.eth.Contract(
        window.publicsaleABI,
        PUBLICSALE_CONTRACT_ADDRESS
    );

    contract.methods.redeemFPTR()
        .send({ from: window.userAddress })
        .then(receipt => { console.log(receipt) });
}

document.getElementById("claimFromPresale").addEventListener("click", async function(event) {
    event.preventDefault();
    claimPreFptrfromPresale();
});

document.getElementById("claimFromPubsale").addEventListener("click", async function(event) {
    event.preventDefault();
    claimPreFptrfromPublicsale();
});

const getprePercentReleased = async function() {
    const contract = new window.web3.eth.Contract(
        window.publicsaleABI,
        PUBLICSALE_CONTRACT_ADDRESS
    );

    let prePercentReleased = await contract.methods.getPercentReleased().call();
    document.getElementById("prePercentReleased").innerText = `${prePercentReleased.slice(0, 5)/1000}%`;
    document.getElementById("prePercentReleased2").innerText = `${prePercentReleased.slice(0, 5)/1000}%`;
}

const checkpFPTRBalance = async function() {
    const contract = new window.web3.eth.Contract(
        window.fptrABI,
        FPTR_CONTRACT_ADDRESS
    );

    let balance = await contract.methods.balanceOf(window.userAddress)
        .call({ from: window.userAddress, account: window.userAddress });
    document.getElementById("pFPTRavailable").innerText = `${balance/1e18}`;
};

//check og FPTR balance
const checkFPTRBalance = async function() {
    const contract = new window.web3.eth.Contract(
        window.ogABI,
        OG_CONTRACT_ADDRESS
    );

    let balance = await contract.methods.balanceOf(window.userAddress)
        .call({ from: window.userAddress, account: window.userAddress });
    document.getElementById("FPTRavailable").innerText = `${balance/1e18}`;
    console.log(balance);
};

//Returns pFPTR balance of the user, to use in bridge
const returnpFPTRBalance = async function() {
    const contract = new window.web3.eth.Contract(
        window.fptrABI,
        FPTR_CONTRACT_ADDRESS
    );

    let balance = await contract.methods.balanceOf(window.userAddress)
        .call({ from: window.userAddress, account: window.userAddress });
    console.log(balance);

    return balance;
};

document.getElementById("approveTwoContracts").addEventListener("click", async function(event) {
    event.preventDefault();
    const bcontract = new window.web3.eth.Contract(
        window.bridgeABI,
        BRIDGE_CONTRACT_ADDRESS
    );
    const pfcontract = new window.web3.eth.Contract(
        window.fptrABI,
        FPTR_CONTRACT_ADDRESS
    );
    const contract = new window.web3.eth.Contract(
        window.ogABI,
        OG_CONTRACT_ADDRESS
    );

    await pfcontract.methods.approve(BRIDGE_CONTRACT_ADDRESS, BigInt(1000000e18)).send({ from: window.userAddress, account: window.userAddress })
        .then(receipt => { console.log(receipt) });

    await contract.methods.approve(BRIDGE_CONTRACT_ADDRESS, BigInt(1000000e18)).send({ from: window.userAddress, account: window.userAddress })
        .then(receipt => { console.log(receipt) });
});

// document.getElementById("migrateToFptrBtn").addEventListener("click", async function(event) {
//     event.preventDefault();
//     let pfptr = await returnpFPTRBalance();
//     const bcontract = new window.web3.eth.Contract(
//         window.bridgeABI,
//         BRIDGE_CONTRACT_ADDRESS
//     );
//     await bcontract.methods.buyFPTR(BigInt(pfptr)).send({ from: window.userAddress, account: window.userAddress })
//         .then(receipt => { console.log(receipt) });
// });

// document.getElementById("recieveFPTRbtn").addEventListener("click", async function(event) {
//     event.preventDefault();
//     // let pfptr = await returnpFPTRBalance();
//     const bcontract = new window.web3.eth.Contract(
//         window.bridgeABI,
//         BRIDGE_CONTRACT_ADDRESS
//     );
//     bcontract.methods.redeemFPTR().send({ from: window.userAddress, account: window.userAddress })
//         .then(receipt => { console.log(receipt) });
// });


// document.getElementById("pFPTRavailable").addEventListener("click", async function(event) {
//     event.preventDefault();
//     checkpFPTRBalance();
// });

// const sendMIMtoContract = async function() {
//     await writecontract.transfer(
//         PRESALE_CONTRACT_ADDRESS,
//         BigInt(1e18)
//     )
// }


const preABI = [
    "function buyFPTR(uint256)",
    "function mimRaised() view returns (uint256)",
    "function wl(address) view returns (bool)"
]

let preReadContract = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, preABI, provider);
let preWriteContract = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, preABI, signer);

// await preWriteContract.buyFPTR(BigInt(1e18));

async function mimRaisedSoFar() {
    const contract = new window.web3.eth.Contract(
        window.presaleABI,
        PRESALE_CONTRACT_ADDRESS
    );

    const contract2 = new window.web3.eth.Contract(
        window.publicsaleABI,
        PUBLICSALE_CONTRACT_ADDRESS
    );

    let mimr = await contract.methods.mimRaised().call({ from: window.userAddress })
    let mimr2 = await contract2.methods.mimRaised().call({ from: window.userAddress })

    let prebuy = await contract.methods.preBuys(window.userAddress).call({ from: window.userAddress })
    let publicbuy = await contract2.methods.preBuys(window.userAddress).call({ from: window.userAddress })

    document.getElementById("mimRaisedsofar").innerText = ` $${web3.utils.fromWei(mimr, "ether").slice(0,7)} + $${web3.utils.fromWei(mimr2, "ether").slice(0,7)}  MIM`;
    // document.getElementById("raised").innerText = ` $${web3.utils.fromWei(mimr2, "ether").slice(0,7)} MIM`;
    document.getElementById("claimable").innerText = ` $${web3.utils.fromWei(prebuy[0], "ether").slice(0,7)} `;
    document.getElementById("claimable2").innerText = ` $${web3.utils.fromWei(publicbuy[0], "ether").slice(0,7)} `;
}

// document.getElementById("approveContract").addEventListener("click", function(event) {
//     event.preventDefault();
//     approveContract2ToUseMIM();
// });

// document.getElementById("buyBtn").addEventListener("click", async function(event) {
//     event.preventDefault();
//     const contract = new window.web3.eth.Contract(
//         window.publicsaleABI,
//         PUBLICSALE_CONTRACT_ADDRESS
//     );

//     let amount = document.getElementById("quantity").value;
//     // amount = parseInt(amount);
//     // if (amount < 95) {
//     //     amount = amount + 100000000;
//     // } else {
//     await contract.methods.buyFPTR(BigInt(amount * 1e18))
//         .send({ from: window.userAddress })
//         .then(receipt => { console.log(receipt) });
// }, false);

window.publicsaleABI = [{ "inputs": [{ "internalType": "uint256", "name": "_rate", "type": "uint256" }, { "internalType": "address", "name": "_wallet", "type": "address" }, { "internalType": "contract ERC20", "name": "_mim", "type": "address" }, { "internalType": "contract ERC20", "name": "_fptr", "type": "address" }, { "internalType": "uint256", "name": "_openingTime", "type": "uint256" }, { "internalType": "uint256", "name": "_closingTime", "type": "uint256" }, { "internalType": "uint256", "name": "_vestedTime", "type": "uint256" }, { "internalType": "uint256", "name": "_minMimPerBuyer", "type": "uint256" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "purchaser", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "MimAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "FPTRAmount", "type": "uint256" }], "name": "TokenPurchase", "type": "event" }, { "inputs": [], "name": "RATE_DECIMALS", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "VESTING_TIME_DECIMALS", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "buyFPTR", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "closingTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "fptr", "outputs": [{ "internalType": "contract ERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getPercentReleased", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "mim", "outputs": [{ "internalType": "contract ERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "mimRaised", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "minMimPerBuyer", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "openingTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "preBuys", "outputs": [{ "internalType": "uint256", "name": "mimAmount", "type": "uint256" }, { "internalType": "uint256", "name": "fptrClaimedAmount", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "rate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "redeemFPTR", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "retreiveExcessFptr", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "retreiveMim", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "totalFptrAmountToDistribute", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "vestedTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "wallet", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }];

window.ogABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "amountFTM", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amountBOG", "type": "uint256" }], "name": "AutoLiquify", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "duration", "type": "uint256" }], "name": "BuybackMultiplierActive", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "owner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [], "name": "MASK", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "Sweep", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "WFTM", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "_isFree", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_maxTxAmount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_maxWallet", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "holder", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }], "name": "approveMax", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "adr", "type": "address" }], "name": "authorize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "autoBuybackEnabled", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "autoLiquidityReceiver", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "holder", "type": "address" }], "name": "checkFree", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "clearBuybackMultiplier", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "pure", "type": "function" }, { "inputs": [], "name": "distributorAddress", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getCirculatingSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "accuracy", "type": "uint256" }], "name": "getLiquidityBacking", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getMultipliedFee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getOwner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bool", "name": "selling", "type": "bool" }], "name": "getTotalFee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "adr", "type": "address" }], "name": "isAuthorized", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "target", "type": "uint256" }, { "internalType": "uint256", "name": "accuracy", "type": "uint256" }], "name": "isOverLiquified", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "isOwner", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "launch", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "launchedAt", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "launchedAtTimestamp", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "marketingFeeReceiver", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "pure", "type": "function" }, { "inputs": [], "name": "pair", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "router", "outputs": [{ "internalType": "contract IUniswapV2Router", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bool", "name": "_enabled", "type": "bool" }, { "internalType": "uint256", "name": "_cap", "type": "uint256" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "uint256", "name": "_period", "type": "uint256" }], "name": "setAutoBuybackSettings", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "numerator", "type": "uint256" }, { "internalType": "uint256", "name": "denominator", "type": "uint256" }, { "internalType": "uint256", "name": "length", "type": "uint256" }], "name": "setBuybackMultiplierSettings", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_minPeriod", "type": "uint256" }, { "internalType": "uint256", "name": "_minDistribution", "type": "uint256" }], "name": "setDistributionCriteria", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "gas", "type": "uint256" }], "name": "setDistributorSettings", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_autoLiquidityReceiver", "type": "address" }, { "internalType": "address", "name": "_marketingFeeReceiver", "type": "address" }], "name": "setFeeReceivers", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_liquidityFee", "type": "uint256" }, { "internalType": "uint256", "name": "_buybackFee", "type": "uint256" }, { "internalType": "uint256", "name": "_reflectionFee", "type": "uint256" }, { "internalType": "uint256", "name": "_marketingFee", "type": "uint256" }, { "internalType": "uint256", "name": "_feeDenominator", "type": "uint256" }], "name": "setFees", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "holder", "type": "address" }], "name": "setFree", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "holder", "type": "address" }, { "internalType": "bool", "name": "exempt", "type": "bool" }], "name": "setIsDividendExempt", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "holder", "type": "address" }, { "internalType": "bool", "name": "exempt", "type": "bool" }], "name": "setIsFeeExempt", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "holder", "type": "address" }, { "internalType": "bool", "name": "exempt", "type": "bool" }], "name": "setIsTxLimitExempt", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "setMaxWallet", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bool", "name": "_enabled", "type": "bool" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "setSwapBackSettings", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_target", "type": "uint256" }, { "internalType": "uint256", "name": "_denominator", "type": "uint256" }], "name": "setTargetLiquidity", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "setTxLimit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "swapEnabled", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "swapThreshold", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "pure", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address payable", "name": "adr", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "holder", "type": "address" }], "name": "unSetFree", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "adr", "type": "address" }], "name": "unauthorize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "stateMutability": "payable", "type": "receive" }];


window.presaleABI = [{
        "inputs": [{
                "internalType": "address",
                "name": "_wl",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "_isWl",
                "type": "bool"
            }
        ],
        "name": "addWhitelisted",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
        }],
        "name": "buyFPTR",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "redeemFPTR",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "retreiveExcessFptr",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "retreiveMim",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{
                "internalType": "uint256",
                "name": "_rate",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_wallet",
                "type": "address"
            },
            {
                "internalType": "contract ERC20",
                "name": "_mim",
                "type": "address"
            },
            {
                "internalType": "contract ERC20",
                "name": "_fptr",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_openingTime",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_closingTime",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_vestedTime",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_maxMimPerBuyer",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "internalType": "address",
                "name": "purchaser",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "MimAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "FPTRAmount",
                "type": "uint256"
            }
        ],
        "name": "TokenPurchase",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "closingTime",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "fptr",
        "outputs": [{
            "internalType": "contract ERC20",
            "name": "",
            "type": "address"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPercentReleased",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "maxMimPerBuyer",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "mim",
        "outputs": [{
            "internalType": "contract ERC20",
            "name": "",
            "type": "address"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "mimRaised",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "openingTime",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "address",
            "name": "",
            "type": "address"
        }],
        "name": "preBuys",
        "outputs": [{
                "internalType": "uint256",
                "name": "mimAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "fptrClaimedAmount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "rate",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "RATE_DECIMALS",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalFptrAmountToDistribute",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "vestedTime",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "VESTING_TIME_DECIMALS",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "wallet",
        "outputs": [{
            "internalType": "address",
            "name": "",
            "type": "address"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "address",
            "name": "",
            "type": "address"
        }],
        "name": "wl",
        "outputs": [{
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }],
        "stateMutability": "view",
        "type": "function"
    }
];

window.fptrABI = [{
        "inputs": [{
                "internalType": "address",
                "name": "account_",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount_",
                "type": "uint256"
            }
        ],
        "name": "_burnFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "inputs": [{
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [{
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
        }],
        "name": "burn",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{
                "internalType": "address",
                "name": "account_",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount_",
                "type": "uint256"
            }
        ],
        "name": "burnFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "subtractedValue",
                "type": "uint256"
            }
        ],
        "name": "decreaseAllowance",
        "outputs": [{
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "addedValue",
                "type": "uint256"
            }
        ],
        "name": "increaseAllowance",
        "outputs": [{
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{
                "internalType": "address",
                "name": "account_",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount_",
                "type": "uint256"
            }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "inputs": [{
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "v",
                "type": "uint8"
            },
            {
                "internalType": "bytes32",
                "name": "r",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
            }
        ],
        "name": "permit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "address",
            "name": "vault_",
            "type": "address"
        }],
        "name": "setVault",
        "outputs": [{
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [{
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [{
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [{
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "address",
            "name": "newOwner_",
            "type": "address"
        }],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "address",
            "name": "account",
            "type": "address"
        }],
        "name": "balanceOf",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "DOMAIN_SEPARATOR",
        "outputs": [{
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [{
            "internalType": "string",
            "name": "",
            "type": "string"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "address",
            "name": "owner",
            "type": "address"
        }],
        "name": "nonces",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{
            "internalType": "address",
            "name": "",
            "type": "address"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "PERMIT_TYPEHASH",
        "outputs": [{
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{
            "internalType": "string",
            "name": "",
            "type": "string"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "vault",
        "outputs": [{
            "internalType": "address",
            "name": "",
            "type": "address"
        }],
        "stateMutability": "view",
        "type": "function"
    }
];

window.bridgeABI = [{
        "inputs": [{
                "internalType": "uint256",
                "name": "_rate",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_wallet",
                "type": "address"
            },
            {
                "internalType": "contract ERC20",
                "name": "_mim",
                "type": "address"
            },
            {
                "internalType": "contract ERC20",
                "name": "_fptr",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_openingTime",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_closingTime",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_vestedTime",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "internalType": "address",
                "name": "purchaser",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "MimAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "FPTRAmount",
                "type": "uint256"
            }
        ],
        "name": "TokenPurchase",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "RATE_DECIMALS",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "VESTING_TIME_DECIMALS",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
        }],
        "name": "buyFPTR",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "closingTime",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "fptr",
        "outputs": [{
            "internalType": "contract ERC20",
            "name": "",
            "type": "address"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPercentReleased",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "mim",
        "outputs": [{
            "internalType": "contract ERC20",
            "name": "",
            "type": "address"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "mimRaised",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "openingTime",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "address",
            "name": "",
            "type": "address"
        }],
        "name": "preBuys",
        "outputs": [{
                "internalType": "uint256",
                "name": "mimAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "fptrClaimedAmount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "rate",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "redeemFPTR",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "retreiveExcessFptr",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "retreiveMim",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalFptrAmountToDistribute",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "vestedTime",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "wallet",
        "outputs": [{
            "internalType": "address",
            "name": "",
            "type": "address"
        }],
        "stateMutability": "view",
        "type": "function"
    }
];
