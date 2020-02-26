const {test} = require('tap');

const {getInfoResponse} = require('./../fixtures');
const {queryRoutesResponse} = require('./../fixtures');
const {subscribeToProbeForRoute} = require('./../../../lnd_methods');

const expectedRoute = {
  confidence: 1000000,
  fee: 0,
  fee_mtokens: '1',
  hops: [{
    channel: '0x0x1',
    channel_capacity: 1,
    fee: 0,
    fee_mtokens: '1',
    forward: 0,
    forward_mtokens: '1',
    public_key: '00',
    timeout: 1,
  }],
  messages: [],
  mtokens: '1',
  safe_fee: 1,
  safe_tokens: 1,
  timeout: 1,
  tokens: 0,
};

const sendToRouteFailure = {
  chan_id: '1',
  code: 'INCORRECT_OR_UNKNOWN_PAYMENT_DETAILS',
  failure_source_index: 1,
};

const makeLnd = ({count, getInfo, sendToRoute}) => {
  let returnedRoutes = 0;

  const defaultSendTo = ({}, cbk) => cbk(null, {faillure: sendToRouteFailure});

  const lnd = {
    default: {
      getInfo: getInfo || (({}, cbk) => cbk(null, getInfoResponse)),
      queryRoutes: ({}, cbk) => {
        if (returnedRoutes === (count || 1)) {
          return cbk(null, {routes: []});
        }

        returnedRoutes++;

        return cbk(null, queryRoutesResponse);
      },
    },
    router: {
      sendToRoute: sendToRoute || defaultSendTo,
    },
  };

  return lnd;
};

const tests = [
  {
    args: {},
    description: 'A destination public key is required',
    error: 'ExpectedDestinationPublicKeyToSubscribeToProbe',
  },
  {
    args: {destination: Buffer.alloc(33).toString('hex'), ignore: 'ignore'},
    description: 'When ignore is specified, an array is expected',
    error: 'ExpectedIgnoreEdgesArrayInProbeSubscription',
  },
  {
    args: {destination: Buffer.alloc(33).toString('hex')},
    description: 'LND is expected to probe',
    error: 'ExpectedRouterRpcToSubscribeToProbe',
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      lnd: {router: {sendToRoute: ({}, cbk) => cbk()}},
    },
    description: 'A token amount is required to subscribe to a probe',
    error: 'ExpectedTokenAmountToSubscribeToProbe',
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      ignore: [{from_public_key: 'from', to_public_key: 'to'}],
      lnd: makeLnd({}),
      probe_timeout_ms: 1,
      tokens: 1,
    },
    description: 'A probe tries a route',
    expected: {failures: [], routes: [expectedRoute]},
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      lnd: makeLnd({getInfo: ({}, cbk) => cbk('err')}),
      tokens: 1,
    },
    description: 'A probe encounters an error getting info',
    expected: {
      error: [503, 'GetWalletInfoErr', {err: 'err'}],
      failures: [],
      routes: [],
    },
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      lnd: makeLnd({getInfo: ({}, cbk) => cbk('err')}),
      suppress_errors: true,
      tokens: 1,
    },
    description: 'Non-listening errors are not emitted',
    expected: {
      failures: [],
      routes: [],
    },
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      lnd: makeLnd({getInfo: ({}, cbk) => cbk(null, {
        alias: '',
        best_header_timestamp: 1,
        block_hash: '00',
        block_height: 1,
        chains: [{chain: 'bitcoin', network: 'mainnet'}],
        color: '#000000',
        features: {},
        identity_pubkey: '020000000000000000000000000000000000000000000000000000000000000000',
        num_active_channels: 0,
        num_peers: 0,
        num_pending_channels: 0,
        synced_to_chain: false,
        uris: [],
        version: ''
      })}),
      tokens: 1,
    },
    description: 'A probe encounters an error getting info',
    expected: {
      error: [400, 'ExpectedFeaturesToSubscribeToProbeDestination'],
      failures: [],
      routes: [],
    },
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      lnd: makeLnd({sendToRoute: ({}, cbk) => setTimeout(() => cbk('e'), 20)}),
      probe_timeout_ms: 1,
      tokens: 1,
    },
    description: 'A probe times out',
    expected: {
      error: [503, 'ProbeTimeout'],
      failures: [],
      routes: [expectedRoute],
    },
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      lnd: makeLnd({sendToRoute: ({}, cbk) => cbk('err')}),
      tokens: 1,
    },
    description: 'A probe hits an error paying a route',
    expected: {
      error: [503, 'UnexpectedErrorWhenPayingViaRoute', {err: 'err'}],
      failures: [],
      routes: [expectedRoute],
    },
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      lnd: makeLnd({
        sendToRoute: ({}, cbk) => cbk(null, {
          failure: {
            chan_id: '1',
            code: 'UNKNOWN_FAILURE',
            failure_source_index: 1,
          },
          preimage: Buffer.alloc(Number()),
        }),
      }),
      tokens: 1,
    },
    description: 'A probe is successful',
    expected: {
      failures: [],
      routes: [expectedRoute],
      success: expectedRoute,
    },
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      lnd: makeLnd({
        sendToRoute: ({}, cbk) => cbk(null, {
          failure: {
            chan_id: '1',
            code: 'UNKNOWN_FAILURE',
            failure_source_index: 0,
          },
          preimage: Buffer.alloc(Number()),
        }),
      }),
      tokens: 1,
    },
    description: 'A probe hits a routing failure',
    expected: {
      failures: [{
        channel: '0x0x1',
        index: 0,
        mtokens: undefined,
        policy: undefined,
        public_key: undefined,
        reason: 'UnknownFailure',
        route: expectedRoute,
        update: undefined,
      }],
      routes: [expectedRoute],
    },
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      lnd: makeLnd({
        sendToRoute: ({}, cbk) => {
          return setTimeout(() => {
            return cbk(null, {
              failure: {
                chan_id: '1',
                code: 'UNKNOWN_FAILURE',
                failure_source_index: 0,
              },
              preimage: Buffer.alloc(Number()),
            });
          },
          50);
        },
      }),
      probe_timeout_ms: 1,
      tokens: 1,
    },
    description: 'A probe hits a routing failure',
    expected: {
      error: [503, 'ProbeTimeout'],
      failures: [],
      routes: [expectedRoute],
    },
  },
  {
    args: {
      destination: Buffer.alloc(33).toString('hex'),
      lnd: makeLnd({
        count: 2,
        sendToRoute: ({}, cbk) => {
          return setTimeout(() => {
            return cbk(null, {
              failure: {
                chan_id: '1',
                code: 'UNKNOWN_FAILURE',
                failure_source_index: 0,
              },
              preimage: Buffer.alloc(Number()),
            });
          },
          50);
        },
      }),
      path_timeout_ms: 1,
      probe_timeout_ms: 1,
      tokens: 1,
    },
    description: 'A probe times out and tries something else',
    expected: {
      error: [503, 'ProbeTimeout'],
      failures: [],
      routes: [expectedRoute],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({deepIs, end, equal, throws}) => {
    if (!!error) {
      throws(() => subscribeToProbeForRoute(args), new Error(error), 'Error');

      return end();
    } else {
      const failures = [];
      let gotError;
      const routes = [];
      let gotSuccess;
      const sub = subscribeToProbeForRoute(args);

      sub.on('error', err => gotError = err);
      sub.on('probe_success', ({route}) => gotSuccess = route);
      sub.on('probing', ({route}) => routes.push(route));
      sub.on('routing_failure', failure => failures.push(failure));

      if (!!args.suppress_errors) {
        sub.removeAllListeners('error');
      }

      sub.on('end', () => {
        deepIs(failures, expected.failures, 'Got expected failures');
        deepIs(gotError, expected.error, 'Got expected error');
        deepIs(gotSuccess, expected.success, 'Got expected success');
        deepIs(routes, expected.routes, 'Got expected routes');

        return end();
      });
    }
  });
});
