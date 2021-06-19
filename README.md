# Lightning

[![npm version](https://badge.fury.io/js/lightning.svg)](https://badge.fury.io/js/lightning)

Methods for working with the Lightning Network

## LND Authentication

To connect to an LND node, authentication details are required.

Export credentials via CLI:
[balanceofsatoshis](https://github.com/alexbosworth/balanceofsatoshis):
`npm install -g balanceofsatoshis` and export via `bos credentials --cleartext`

Or export them manually:

Run `base64` on the tls.cert and admin.macaroon files to get the encoded
authentication data to create the LND connection. You can find these files in
the LND directory. (~/.lnd or ~/Library/Application Support/Lnd)

    base64 ~/.lnd/tls.cert | tr -d '\n'
    base64 ~/.lnd/data/chain/bitcoin/mainnet/admin.macaroon | tr -d '\n'

You can then use these to interact with your LND node directly:

```node
const {authenticatedLndGrpc} = require('lightning');

const {lnd} = authenticatedLndGrpc({
  cert: 'base64 encoded tls.cert file',
  macaroon: 'base64 encoded admin.macaroon file',
  socket: '127.0.0.1:10009',
});
```

To access unauthenticated methods like the wallet unlocker, use 
`unauthenticatedLndGrpc` instead.

## Methods

There are two libraries, [ln-service](https://github.com/alexbosworth/ln-service) and this library.

Methods exported by this library support typescript, but ln-service includes additional metthods.

- [Documetatiion of Methods]: https://github.com/alexbosworth/ln-service#all-methods

- [addPeer](https://github.com/alexbosworth/ln-service#addpeer): Connect to a new peer
- [authenticatedLndGrpc](https://github.com/alexbosworth/ln-service#authenticatedlndgrpc): 
    Instantiate connection to authenticated lnd methods.
- [broadcastChainTransaction](https://github.com/alexbosworth/ln-service#broadcastchaintransaction):
    Publish an on-chain transaction to the network.
- [cancelHodlInvoice](https://github.com/alexbosworth/ln-service#cancelhodlinvoice): Cancel an
    open invoice.
- [cancelPendingChannel](https://github.com/alexbosworth/ln-service#cancelpendingchannel):
    Cancel a pending channel.
- [closeChannel](https://github.com/alexbosworth/ln-service#closechannel): Close a channel out to
    the chain.
- [connectWatchtower](https://github.com/alexbosworth/ln-service#connectwatchtower): Connect a
    new watchtower.
- [createChainAddress](https://github.com/alexbosworth/ln-service#createchainaddress): Generate
    a chain address to receive on-chain funds.
- [createHodlInvoice](https://github.com/alexbosworth/ln-service#createhodlinvoice): Make a new
    off-chain invoice that will not automatically accept payment.
- [createInvoice](https://github.com/alexbosworth/ln-service#createinvoice): Make a new off-chain
    invoice.
- [decodePaymentRequest](https://github.com/alexbosworth/ln-service#decodepaymentrequest):
    Get parsed details for a payment request.
- [deleteForwardingReputations](https://github.com/alexbosworth/ln-service#deleteforwardingreputations)
    Clear pathfinding reputations of routing nodes and channels.
- [deletePayments](https://github.com/alexbosworth/ln-service#deletepayments): Remove all
    past payment records.
- [diffieHellmanComputeSecret](https://github.com/alexbosworth/ln-service#diffiehellmancomputesecret):
    Calculate a shared secret to enable symmetric encryption of data to another node.
- [fundPendingChannels](https://github.com/alexbosworth/ln-service#fundpendingchannels):
    Provide a signed funding source for opening channels.
- [fundPsbt](https://github.com/alexbosworth/ln-service#fundpsbt): Make a PSBT with funds and
    change to setup a future on-chain spend.
- [getAccessIds](https://github.com/alexbosworth/ln-service#getaccessids): List the access tokens
    granted permission to access the node.
- [getAutopilot](https://github.com/alexbosworth/ln-service#getautopilot): Retrieve channel open
    autopilot configuration.
- [getBackup](https://github.com/alexbosworth/ln-service#getbackup): Get recovery details for a
    specific channel.
- [getBackups](https://github.com/alexbosworth/ln-service#getbackups): Get recovery details for
    all channels.
- [getChainBalance](https://github.com/alexbosworth/ln-service#getchainbalance): Get the amount
    of on-chain funds.
- [getChainFeeEstimate](https://github.com/alexbosworth/ln-service#getchainfeeestimate):
    Estimate a chain fee to send funds to an address.
- [getChainFeeRate](https://github.com/alexbosworth/ln-service#getchainfeerate): Get an estimate
    for an on-chain fee rate.
- [getChainTransactions](https://github.com/alexbosworth/ln-service#getchaintransactions): List
    past on-chain transactions.
- [getChannel](https://github.com/alexbosworth/ln-service#getchannel): Lookup network graph
    details about a channel.
- [getChannelBalance](https://github.com/alexbosworth/ln-service#getchannelbalance): Calculate
    the total off-chain balance on the node.
- [getChannels](https://github.com/alexbosworth/ln-service#getchannels): List open channels on
    the node.
- [getClosedChannels](https://github.com/alexbosworth/ln-service#getclosedchannels): List closed
    channels on the node.
- [getFeeRates](https://github.com/alexbosworth/ln-service#getfeerates): List routing fee rates
    and routing policies of channels on the node.
- [getForwardingConfidence](https://github.com/alexbosworth/ln-service#getforwardingconfidence):
    Calculate the pathfinding confidence score for routing a payment.
- [getForwardingReputations](https://github.com/alexbosworth/ln-service#getforwardingreputations):
    List the pathfinding reputations for payment routing.
- [getForwards](https://github.com/alexbosworth/ln-service#getforwards): List past forwards routed
    through the node.
- [getHeight](https://github.com/alexbosworth/ln-service#getheight): Lookup the current best chain
    height.
- [getIdentity](https://github.com/alexbosworth/ln-service#getidentity): Derive the identity public
    key of the node.
- [getInvoice](https://github.com/alexbosworth/ln-service#getinvoice): Lookup the status of an
    invoice.
- [getInvoices](https://github.com/alexbosworth/ln-service#getinvoices): List details of all past
    open invoices and received payments.
- [getMethods](https://github.com/alexbosworth/ln-service#getmethods): List RPC methods and
    permissions required to use them.
- [getNetworkCentrality](https://github.com/alexbosworth/ln-service#getnetworkcentrality):
    Calculate the graph centrality score of a node.
- [getNetworkGraph](https://github.com/alexbosworth/ln-service#getnetworkgraph): List all graph
    routing nodes and all channels.
- [getNetworkInfo](https://github.com/alexbosworth/ln-service#getnetworkinfo): Calculate network
    graph statistics.
- [getNode](https://github.com/alexbosworth/ln-service#getnode): Retrieve graph details for a
    node and optionally list its channels.
- [getPayment](https://github.com/alexbosworth/ln-service#getpayment): Lookup details abou a
    past payment.
- [getPayments](https://github.com/alexbosworth/ln-service#getpayments): List details about past
    payment attempts and paid payment requests.
- [getPeers](https://github.com/alexbosworth/ln-service#getpeers): List details of connected nodes.
- [getPendingChainBalance](https://github.com/alexbosworth/ln-service#getpendingchainbalance):
    Calculate the unconfirmed on-chain balance.
- [getPendingChannels](https://github.com/alexbosworth/ln-service#getpendingchannels): List
    details of opening or closing channels.
- [getPublicKey](https://github.com/alexbosworth/ln-service#getpublickey): Derive a public key at
    a given index.
- [getRouteThroughHops](https://github.com/alexbosworth/ln-service#getroutethroughhops):
    Calculate a route through specified nodes.
- [getRouteToDestination](https://github.com/alexbosworth/ln-service#getroutetodestination):
    Calculate a route through the graph to a destination.
- [getSweepTransactions](https://github.com/alexbosworth/ln-service#getsweeptransactions): List
    transactions that are sweeping funds on-chain.
- [getUtxos](https://github.com/alexbosworth/ln-service#getutxos): List unspent transaction outputs
    in the on-chain wallet.
- [getWalletInfo](https://github.com/alexbosworth/ln-service#getwalletinfo): Lookup general details
    about the node.
- [getWalletVersion](https://github.com/alexbosworth/ln-service#getwalletversion): Retrieve the
    version and build tags of the node.
- [grantAccess](https://github.com/alexbosworth/ln-service#grantaccess): Create an access
    credential macaroon to access the API.
- [lockUtxo](https://github.com/alexbosworth/ln-service#lockutxo): Lease a UTXO so it cannot be
    chosen to be spent.
- [openChannel](https://github.com/alexbosworth/ln-service#openchannel): Create a new channel
    to another node.
- [openChannels](https://github.com/alexbosworth/ln-service#openchannels): Open multiple
    channels in a single on-chain transaction batch.
- [pay](https://github.com/alexbosworth/ln-service#pay): Make an off-chain payment.
- [payViaPaymentDetails](https://github.com/alexbosworth/ln-service#payviapaymentdetails): Pay
    off-chain using details about a destination invoice.
- [payViaPaymentRequest](https://github.com/alexbosworth/ln-service#payviapaymentrequest):
    Pay a payment request off-chain.
- [payViaRoutes](https://github.com/alexbosworth/ln-service#payviaroutes):  Pay to a destination
    using a specified route or routes.
- [prepareForChannelProposal](https://github.com/alexbosworth/ln-service#prepareforchannelproposal):
    Prepare to receive a custom channel proposal.
- [proposeChannel](https://github.com/alexbosworth/ln-service#proposechannel): Propose a new
    channel to a peer who has prepared for the channel proposal.
- [recoverFundsFromChannel](https://github.com/alexbosworth/ln-service#recoverfundsfromchannel):
    Attempt to recover channel funds from a specific channel backup.
- [recoverFundsFromChannels](https://github.com/alexbosworth/ln-service#recoverfundsfromchannels):
    Attempt to recover funds from multiple channels using a multiple channel backup.
- [removePeer](https://github.com/alexbosworth/ln-service#removepeer): Disconnect from a
    connected peer.
- [revokeAccess](https://github.com/alexbosworth/ln-service#revokeaccess): Remove the access
    privileges of a previously issued access token macaroon credential.
- [sendToChainAddress](https://github.com/alexbosworth/ln-service#sendtochainaddress): Send
    funds on-chain to an address.
- [sendToChainAddresses](https://github.com/alexbosworth/ln-service#sendtochainaddresses):
    Send funds on-chain to multiple chain addresses.
- [setAutopilot](https://github.com/alexbosworth/ln-service#setautopilot): Set the open channel
    autopilot configuration settings.
- [settleHodlInvoice](https://github.com/alexbosworth/ln-service#settlehodlinvoice): Take incoming
      off-chain funds when an invoice has held funds from an incoming payment.
- [signBytes](https://github.com/alexbosworth/ln-service#signbytes): Use node keys to sign over an
    arbitrary set of bytes.
- [signMessage](https://github.com/alexbosworth/ln-service#signmessage): Use the node identity
    key to generate a signed message that represents the public graph node identity.
- [signPsbt](https://github.com/alexbosworth/ln-service#signpsbt): Sign inputs and finalize a
    partially signed transaction in the PSBT format to prepare it for broadcast.
- [signTransaction](https://github.com/alexbosworth/ln-service#signtransaction): Generate
    signatures required for inputs on a transaction.
- [stopDaemon](https://github.com/alexbosworth/ln-service#stopdaemon): Send a shutdown
    request to cleanly kill the daemon.
- [subscribeToBackups](https://github.com/alexbosworth/ln-service#subscribetobackups): Get
    notified on channel funds recovery backup file updates.
- [subscribeToBlocks](https://github.com/alexbosworth/ln-service#subscribetoblocks): Get notified
    when the Blockchain is updated.
- [subscribeToChainAddress](https://github.com/alexbosworth/ln-service#subscribetochainaddress):
    Get notified when funds are sent to an on-chain address.
- [subscribeToChainSpend](https://github.com/alexbosworth/ln-service#subscribetochainspend):
    Get notified when a UTXO is spent.
- [subscribeToChannels](https://github.com/alexbosworth/ln-service#subscribetochannels): Get
    notified when the set of active channels is updated.
- [subscribeToForwardRequests](https://github.com/alexbosworth/ln-service#subscribetoforwardrequests):
    Get notified on requests to begin forward flows and interactively accept or reject or settle them.
- [subscribeToForwards](https://github.com/alexbosworth/ln-service#subscribetoforwards): Get
    notified on off-chain routed payment events.
- [subscribeToGraph](https://github.com/alexbosworth/ln-service#subscribetograph): Get notified
    of changes to the public routing graph nodes and channels.
- [subscribeToInvoice](https://github.com/alexbosworth/ln-service#subscribetoinvoice): Get notified
    of status updates for incoming payments.
- [subscribeToInvoices](https://github.com/alexbosworth/ln-service#subscribetoinvoices): Get
    notified of status updates on past created invoices.
- [subscribeToOpenRequests](https://github.com/alexbosworth/ln-service#subscribetoopenrequests):
    Get notified on requests to open an inbound channel and interactively accept or reject them.
- [subscribeToPastPayment](https://github.com/alexbosworth/ln-service#subscribetopastpayment):
    Get notified of the current and ongoing status of a past off-chain payment.
- [subscribeToPayViaDetails](https://github.com/alexbosworth/ln-service#subscribetopayviadetails):
    Make an off-chain payment using payment details and subscribe to the status of that payment.
- [subscribeToPayViaRequest](https://github.com/alexbosworth/ln-service#subscribetopayviarequest):
    Make an off-chain payment using a payment request and subscribe to the payment status.
- [subscribeToPayViaRoutes](https://github.com/alexbosworth/ln-service#subscribetopayviaroutes):
    Start an off-chain payment using specific payment routes and subscribe to the payment result.
- [subscribeToProbeForRoute](https://github.com/alexbosworth/ln-service#subscribetoprobeforroute):
    Start an off-chain probe to find a payable route and get notified on the status of the probe.
- [subscribeToTransactions](https://github.com/alexbosworth/ln-service#subscribetotransactions):
    Get notified on on-chain transaction activity.
- [unauthenticatedLndGrpc](https://github.com/alexbosworth/ln-service#unauthenticatedlndgrpc):
    Create an lnd object for use with methods that do not require authentication credentials.
- [unlockUtxo](https://github.com/alexbosworth/ln-service#unlockutxo): Release a lease on a wallet
    UTXO to allow it to be selected for spending again.
- [updateChainTransaction](https://github.com/alexbosworth/ln-service#updatechaintransaction):
    Edit the metadata of an on-chain transaction record.
- [updateRoutingFees](https://github.com/alexbosworth/ln-service#updateroutingfees): Set the
    forwarding fees or other routing policies for a channel or all channels.
- [verifyBackup](https://github.com/alexbosworth/ln-service#verifybackup): Check if a channel fund
    recovery backup file is valid.
- [verifyBackups](https://github.com/alexbosworth/ln-service#verifybackups): Check if multiple
    channel fund recovery backups are valid.
- [verifyBytesSignature](https://github.com/alexbosworth/ln-service#verifybytessignature): Check
    that a signature over arbitrary bytes is valid.
- [verifyMessage](https://github.com/alexbosworth/ln-service#verifymessage): Check that a
    message from a node in the graph has a valid signature.
