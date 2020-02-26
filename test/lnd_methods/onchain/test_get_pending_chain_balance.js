const {test} = require('tap');

const {getPendingChainBalance} = require('./../../../lnd_methods');

const makeLnd = ({pendingChannels, walletBalance}) => {
  const defaultPending = ({}, cbk) => cbk(null, {total_limbo_balance: '1'});
  const defaultBalance = ({}, cbk) => cbk(null, {unconfirmed_balance: '2'});

  return {
    default: {
      pendingChannels: pendingChannels || defaultPending,
      walletBalance: walletBalance || defaultBalance,
    },
  };
};

const tests = [
  {
    args: {},
    description: 'LND is expected to get pending chain balance',
    error: [400, 'ExpectedLndForPendingChainBalance'],
  },
  {
    args: {lnd: makeLnd({pendingChannels: ({}, cbk) => cbk('err')})},
    description: 'Errors are returned from pending channels',
    error: [503, 'GetPendingChannelsErr', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({pendingChannels: ({}, cbk) => cbk()})},
    description: 'A response is expected from pending channels',
    error: [503, 'ExpectedTotalLimboBalance'],
  },
  {
    args: {lnd: makeLnd({pendingChannels: ({}, cbk) => cbk(null, {})})},
    description: 'A limbo balance is expected from pending channels',
    error: [503, 'ExpectedTotalLimboBalance'],
  },
  {
    args: {lnd: makeLnd({walletBalance: ({}, cbk) => cbk('err')})},
    description: 'Errors are returned from wallet balance',
    error: [503, 'GetChainBalanceError', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({walletBalance: ({}, cbk) => cbk()})},
    description: 'A response is expected from wallet balance',
    error: [503, 'ExpectedUnconfirmedBalance'],
  },
  {
    args: {lnd: makeLnd({walletBalance: ({}, cbk) => cbk(null, {})})},
    description: 'An unconfirmed balance is expected from wallet balance',
    error: [503, 'ExpectedUnconfirmedBalance'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Pending chain balance is returned',
    expected: 3,
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepEqual, end, equal, rejects}) => {
    if (!!error) {
      await rejects(() => getPendingChainBalance(args), error, 'Got error');
    } else {
      const res = await getPendingChainBalance(args);

      equal(res.pending_chain_balance, expected, 'Got pending balance');
    }

    return end();
  });
});
