const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');
const {rpcPaymentAsPayment} = require('./../../lnd_responses');
const {sortBy} = require('./../../arrays');

const defaultLimit = 250;
const {isArray} = Array;
const isPending = payment => !!payment && payment.status === 'IN_FLIGHT';
const lastPageFirstIndexOffset = 1;
const method = 'listPayments';
const {parse} = JSON;
const {stringify} = JSON;
const type = 'default';

/** Get pending payments made through channels.

  Requires `offchain:read` permission

  {
    [limit]: <Page Result Limit Number>
    lnd: <Authenticated LND API Object>
    [token]: <Opaque Paging Token String>
  }

  @returns via cbk or Promise
  {
    payments: [{
      attempts: [{
        [failure]: {
          code: <Error Type Code Number>
          [details]: {
            [channel]: <Standard Format Channel Id String>
            [height]: <Error Associated Block Height Number>
            [index]: <Failed Hop Index Number>
            [mtokens]: <Error Millitokens String>
            [policy]: {
              base_fee_mtokens: <Base Fee Millitokens String>
              cltv_delta: <Locktime Delta Number>
              fee_rate: <Fees Charged in Millitokens Per Million Number>
              [is_disabled]: <Channel is Disabled Bool>
              max_htlc_mtokens: <Maximum HLTC Millitokens Value String>
              min_htlc_mtokens: <Minimum HTLC Millitokens Value String>
              updated_at: <Updated At ISO 8601 Date String>
            }
            [timeout_height]: <Error CLTV Timeout Height Number>
            [update]: {
              chain: <Chain Id Hex String>
              channel_flags: <Channel Flags Number>
              extra_opaque_data: <Extra Opaque Data Hex String>
              message_flags: <Message Flags Number>
              signature: <Channel Update Signature Hex String>
            }
          }
          message: <Error Message String>
        }
        [index]: <Payment Add Index Number>
        [confirmed_at]: <Payment Confirmed At ISO 8601 Date String>
        created_at: <Attempt Was Started At ISO 8601 Date String>
        [failed_at]: <Payment Attempt Failed At ISO 8601 Date String>
        is_confirmed: <Payment Attempt Succeeded Bool>
        is_failed: <Payment Attempt Failed Bool>
        is_pending: <Payment Attempt is Waiting For Resolution Bool>
        route: {
          fee: <Route Fee Tokens Number>
          fee_mtokens: <Route Fee Millitokens String>
          hops: [{
            channel: <Standard Format Channel Id String>
            channel_capacity: <Channel Capacity Tokens Number>
            fee: <Fee Number>
            fee_mtokens: <Fee Millitokens String>
            forward: <Forward Tokens Number>
            forward_mtokens: <Forward Millitokens String>
            [public_key]: <Forward Edge Public Key Hex String>
            [timeout]: <Timeout Block Height Number>
          }]
          mtokens: <Total Fee-Inclusive Millitokens String>
          [payment]: <Payment Identifier Hex String>
          timeout: <Timeout Block Height Number>
          tokens: <Total Fee-Inclusive Tokens Number>
          [total_mtokens]: <Total Millitokens String>
        }
      }]
      created_at: <Payment at ISO-8601 Date String>
      [destination]: <Destination Node Public Key Hex String>
      id: <Payment Preimage Hash String>
      [index]: <Payment Add Index Number>
      is_confirmed: <Payment is Confirmed Bool>
      is_outgoing: <Transaction Is Outgoing Bool>
      mtokens: <Millitokens Attempted to Pay to Destination String>
      [request]: <BOLT 11 Payment Request String>
      safe_tokens: <Payment Tokens Attempted to Pay Rounded Up Number>
      tokens: <Rounded Down Tokens Attempted to Pay to Destination Number>
    }]
    [next]: <Next Opaque Paging Token String>
  }
*/
module.exports = ({limit, lnd, token}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!!limit && !!token) {
          return cbk([400, 'ExpectedNoLimitPagingPendingPaymentsWithToken']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndForGetPendingPaymentsRequest']);
        }

        return cbk();
      },

      // Get all payments
      listPayments: ['validate', ({}, cbk) => {
        let offset;
        let resultsLimit = limit || defaultLimit;

        if (!!token) {
          try {
            const pagingToken = parse(token);

            offset = pagingToken.offset;
            resultsLimit = pagingToken.limit;
          } catch (err) {
            return cbk([400, 'ExpectedValidPagingTokenForGetPending', {err}]);
          }
        }

        return lnd[type][method]({
          include_incomplete: true,
          index_offset: offset || Number(),
          max_payments: resultsLimit,
          reversed: true,
        },
        (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedGetPendingPaymentsError', {err}]);
          }

          if (!res || !isArray(res.payments)) {
            return cbk([503, 'ExpectedPendingPaymentsInListPaymentsResponse']);
          }

          if (typeof res.last_index_offset !== 'string') {
            return cbk([503, 'ExpectedLastIndexOffsetWhenRequestingPending']);
          }

          const lastOffset = Number(res.last_index_offset);
          const offset = Number(res.first_index_offset);

          const token = stringify({offset, limit: resultsLimit});

          return cbk(null, {
            payments: res.payments.filter(isPending),
            token: offset <= lastPageFirstIndexOffset ? undefined : token,
          });
        });
      }],

      // Check and map payments
      foundPayments: ['listPayments', ({listPayments}, cbk) => {
        try {
          const payments = listPayments.payments.map(rpcPaymentAsPayment);

          return cbk(null, payments);
        } catch (err) {
          return cbk([503, err.message]);
        }
      }],

      // Final found pending payments
      payments: [
        'foundPayments',
        'listPayments',
        ({foundPayments, listPayments}, cbk) =>
      {
        const payments = sortBy({
          array: foundPayments,
          attribute: 'created_at',
        });

        return cbk(null, {
          next: listPayments.token || undefined,
          payments: payments.sorted.reverse(),
        });
      }],
    },
    returnResult({reject, resolve, of: 'payments'}, cbk));
  });
};
