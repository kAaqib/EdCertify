// Contract address and ABI (replace with your actual contract address and ABI)

const contractAddress = '0x26c53822705E0C0314E1D0a79d7aE350c4F5B51b';
const contractABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "certificateId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "certificateHash",
				"type": "string"
			}
		],
		"name": "CertificateHashStored",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "certificateId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "certificateHash",
				"type": "string"
			}
		],
		"name": "storeCertificateHash",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "certificateId",
				"type": "uint256"
			}
		],
		"name": "getStoredCertificateHash",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// Function to generate a 10-digit unique ID
function generateUniqueId() {
    return Math.floor(Math.random() * 9000000000) + 1000000000;
}

// Function to handle hashing of the uploaded image and generate a unique ID
async function hashImageWithUniqueId() {
    const fileInput = document.getElementById('imageInput');
    const hashElement = document.getElementById('imageHash');

    // Check if a file is selected
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select an image file.');
        return;
    }

    const imageFile = fileInput.files[0];
    const reader = new FileReader();

    // Read the contents of the image file
    reader.readAsArrayBuffer(imageFile);

    // Once the reading is complete, calculate the hash and generate a unique ID
    reader.onloadend = async () => {
        try {
            const buffer = new Uint8Array(reader.result);
            const hashArrayBuffer = await crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hashArrayBuffer));
            const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

            // Generate a unique 10-digit ID
            const uniqueId = generateUniqueId();

            // Display the generated hash and unique ID
            hashElement.textContent = "Image Hash:" + hashHex + " Unique ID:" + uniqueId + " (KEEP YOUR UNIQUE ID SAFE, IT'S REQUIRED DURING VERIFICATION)";
        } catch (error) {
            console.error('Error generating image hash:', error);
            alert('An error occurred while generating the image hash.');
        }
    };
}

async function regVerify() {
    function hashData(regid) {
        const hashed = CryptoJS.SHA256(regid).toString(CryptoJS.enc.Hex);
        return hashed;
    }
    
    // Example of hashing certificate data
    const regid = document.getElementById('regid').value;
    const regpin = document.getElementById('regpin').value;
    const idHash = hashData(regid);
    console.log('Certificate Hash:', idHash);

    const certificateId = regpin;
    const presentedCertificateHash = idHash;

    console.log('Certificate ID for Verification:', certificateId);
    console.log('Presented Certificate Hash:', presentedCertificateHash);

    if (!certificateId || !presentedCertificateHash) {
        alert('Please enter both University ID and 10-digit Security Pin for registration.');
        return;
    }

    // Ensure the hash is a valid hexadecimal string with an even length
    if (!/^(0x)?[0-9a-fA-F]{64}$/.test(presentedCertificateHash)) {
        alert('Invalid format.');
        return;
    }

    // Remove '0x' prefix if present
    const formattedPresentedHash = presentedCertificateHash.startsWith('0x') ? presentedCertificateHash.slice(2) : presentedCertificateHash;

    // Assuming you are using MetaMask for Ethereum interaction
    if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask to interact with the Ethereum blockchain.');
        return;
    }

    try {
        // Request account access if needed
        await window.ethereum.enable();

        // Contract address and ABI (replace with your actual contract address and ABI)
        
        console.log('Contract Address:', contractAddress);

        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        //console.log('Contract:', contract);

        // Call the smart contract function to retrieve the stored certificate hash
        const storedCertificateHash = await contract.methods.getStoredCertificateHash(certificateId).call();
        console.log('Stored Certificate Hash:', storedCertificateHash);

        // Compare the presented hash with the stored hash
        if (formattedPresentedHash === storedCertificateHash) {
            alert('You are already registered. Please login.');
            window.location.href = "login.html";
        } else {
            const certificateId = regpin;
            const certificateHash = idHash;

            console.log('Certificate ID:', certificateId);
            console.log('Certificate Hash:', certificateHash);

            if (!certificateId || !certificateHash) {
                alert('Please enter both certificate ID and hash for storing.');
                return;
            }

            // Ensure the hash is a valid hexadecimal string with an even length
            if (!/^(0x)?[0-9a-fA-F]{64}$/.test(certificateHash)) {
                alert('Invalid certificate hash format.');
                return;
            }

            // Remove '0x' prefix if present
            const formattedHash = certificateHash.startsWith('0x') ? certificateHash.slice(2) : certificateHash;

            // Assuming you are using MetaMask for Ethereum interaction
            if (typeof window.ethereum === 'undefined') {
                alert('Please install MetaMask to interact with the Ethereum blockchain.');
                return;
            }

            try {
                // Request account access if needed
                await window.ethereum.enable();
                console.log('Contract Address:', contractAddress);

                const web3 = new Web3(window.ethereum);
                const contract = new web3.eth.Contract(contractABI, contractAddress);
                console.log('Contract:', contract);

                // Call the smart contract function to store the certificate hash
                await contract.methods.storeCertificateHash(certificateId, formattedHash).send({ from: (await web3.eth.getAccounts())[0] });
            } catch (error) {
                console.error('Error storing certificate hash:', error);
                alert('An error occurred. Please check the console for details.');
            }
            alert('You have been registered successfully. You can now login');
            window.location.href = "login.html";
        }
    } catch (error) {
        console.error('Error verifying certificate hash:', error);
        alert('An error occurred. Please check the console for details.');
    }
}

async function logVerify() {
    function hashData(regid) {
        const hashed = CryptoJS.SHA256(regid).toString(CryptoJS.enc.Hex);
        return hashed;
    }
    
    // Example of hashing certificate data
    const logid = document.getElementById('logid').value;
    const logpin = document.getElementById('logpin').value;
    const idHash = hashData(logid);
    console.log('Certificate Hash:', idHash);

    const certificateId = logpin;
    const presentedCertificateHash = idHash;

    console.log('Certificate ID for Verification:', certificateId);
    console.log('Presented Certificate Hash:', presentedCertificateHash);

    if (!certificateId || !presentedCertificateHash) {
        alert('Please enter both University ID and 10-digit Security Pin for registration.');
        return;
    }

    // Ensure the hash is a valid hexadecimal string with an even length
    if (!/^(0x)?[0-9a-fA-F]{64}$/.test(presentedCertificateHash)) {
        alert('Invalid format.');
        return;
    }

    // Remove '0x' prefix if present
    const formattedPresentedHash = presentedCertificateHash.startsWith('0x') ? presentedCertificateHash.slice(2) : presentedCertificateHash;

    // Assuming you are using MetaMask for Ethereum interaction
    if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask to interact with the Ethereum blockchain.');
        return;
    }

    try {
        // Request account access if needed
        await window.ethereum.enable();
        console.log('Contract Address:', contractAddress);
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        //console.log('Contract:', contract);

        // Call the smart contract function to retrieve the stored certificate hash
        const storedCertificateHash = await contract.methods.getStoredCertificateHash(certificateId).call();
        console.log('Stored Certificate Hash:', storedCertificateHash);

        // Compare the presented hash with the stored hash
        if (formattedPresentedHash === storedCertificateHash) {
            window.location.href = "upload.html";
        } else {
            alert("Invalid Credentials or User is not registered.")
        }
    } catch (error) {
        console.error('Error verifying certificate hash:', error);
        alert('An error occurred. Please check the console for details.');
    }
}

async function storeCertificate() {
    const certificateId = document.getElementById('certificateIdInput').value;
    const certificateHash = document.getElementById('certificateInput').value;

    console.log('Certificate ID:', certificateId);
    console.log('Certificate Hash:', certificateHash);

    if (!certificateId || !certificateHash) {
        alert('Please enter both certificate ID and hash for storing.');
        return;
    }

    // Ensure the hash is a valid hexadecimal string with an even length
    if (!/^(0x)?[0-9a-fA-F]{64}$/.test(certificateHash)) {
        alert('Invalid certificate hash format.');
        return;
    }

    // Remove '0x' prefix if present
    const formattedHash = certificateHash.startsWith('0x') ? certificateHash.slice(2) : certificateHash;

    // Assuming you are using MetaMask for Ethereum interaction
    if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask to interact with the Ethereum blockchain.');
        return;
    }

    try {
        // Request account access if needed
        await window.ethereum.enable();
        
        console.log('Contract Address:', contractAddress);

        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        console.log('Contract:', contract);

        // Call the smart contract function to store the certificate hash
        await contract.methods.storeCertificateHash(certificateId, formattedHash).send({ from: (await web3.eth.getAccounts())[0] });

        alert('Certificate hash stored successfully!');
    } catch (error) {
        console.error('Error storing certificate hash:', error);
        alert('An error occurred. Please check the console for details.');
    }
}

async function verifyCertificate() {
    const certificateId = document.getElementById('verifyIdInput').value;
    const presentedCertificateHash = document.getElementById('verifyInput').value;

    console.log('Certificate ID for Verification:', certificateId);
    console.log('Presented Certificate Hash:', presentedCertificateHash);

    if (!certificateId || !presentedCertificateHash) {
        alert('Please enter both certificate ID and hash for verification.');
        return;
    }

    // Ensure the hash is a valid hexadecimal string with an even length
    if (!/^(0x)?[0-9a-fA-F]{64}$/.test(presentedCertificateHash)) {
        alert('Invalid certificate hash format.');
        return;
    }

    // Remove '0x' prefix if present
    const formattedPresentedHash = presentedCertificateHash.startsWith('0x') ? presentedCertificateHash.slice(2) : presentedCertificateHash;

    // Assuming you are using MetaMask for Ethereum interaction
    if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask to interact with the Ethereum blockchain.');
        return;
    }

    try {
        // Request account access if needed
        await window.ethereum.enable();
        console.log('Contract Address:', contractAddress);

        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        //console.log('Contract:', contract);

        // Call the smart contract function to retrieve the stored certificate hash
        const storedCertificateHash = await contract.methods.getStoredCertificateHash(certificateId).call();
        console.log('Stored Certificate Hash:', storedCertificateHash);

        // Compare the presented hash with the stored hash
        if (formattedPresentedHash === storedCertificateHash) {
            alert('Certificate is verified successfully!');
        } else {
            alert('Certificate verification failed. Hashes do not match.');
        }
    } catch (error) {
        console.error('Error verifying certificate hash:', error);
        alert('An error occurred. Please check the console for details.');
    }
}
