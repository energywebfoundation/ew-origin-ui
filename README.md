# EW Origin UI

## Install

In order to install the UI, you have to call `npm install`.

## Start
In order to start the UI, you have to call `npm start`. The UI needs a running ethereum-client and a web3-object. 

Afterward, the webpage can be accessed with `localhost:3000/COO-CONTRACT_ADDRESS/` where `COO-CONTRACT_ADDRESS` is the address of the coo-contract. You can find the address inside `contractConfig.json` file in your demo/lib project. 

### Web3-object
In order to use the UI and Origin, you need a web3-provider. We recommend [MetaMask](https://metamask.io). Make sure your MetaMask extension is pointed to `localhost:8545`.

### Pilot instructions

1. Create a supply
    * In UI go to *Admin > Create Supply* section
    * Signed in as Sonnen asset owner
2. Create a demand
    * In UI go to *Admin > Create Demand* section
    * Signed in as E.DIS trader
3. Create an agreement
    * In UI go to *Admin > Create Agreement* section
    * Signed in as E.DIS trader
    * You can get IDs for supply and demand by going to *Demands*, *Supplies* sections in UI
4. Save smart meter reading
    * Call saveSmartMeterRead() function programatically
    * Signed in as Smart meter
5. Approve certificate
    * In UI go to *Admin > Approve Certificate*
    * *Get Reported Flexibility* returns `false` under `Report Confirmed`
    * *Approve Certificate*
    * Signed in as E.DIS trader
    * *Get Reported Flexibility* now returns `true` under `Report Confirmed`
