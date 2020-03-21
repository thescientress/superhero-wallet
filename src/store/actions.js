import BigNumber from 'bignumber.js';
import { flatten, uniqBy } from 'lodash-es';
import router from '../popup/router/index';
import { postMessage } from '../popup/utils/connection';
import { BACKEND_URL, DEFAULT_NETWORK } from '../popup/utils/constants';
import { aettosToAe, convertToAE, parseFromStorage, stringifyForStorage } from '../popup/utils/helper';
import * as popupMessages from '../popup/utils/popup-messages';
import * as types from './mutation-types';

export default {
  setAccount({ commit }, payload) {
    commit(types.UPDATE_ACCOUNT, payload);
    commit(types.UPDATE_BALANCE);
  },
  setSubAccount({ commit }, payload) {
    commit(types.SET_SUBACCOUNT, payload);
  },
  setSubAccounts({ commit }, payload) {
    commit(types.SET_SUBACCOUNTS, payload);
  },
  async switchNetwork({ commit }, payload) {
    await browser.storage.local.set({ activeNetwork: payload });
    return commit(types.SWITCH_NETWORK, payload);
  },
  async updateBalance({ commit, state }) {
    const balance = await state.sdk.balance(state.account.publicKey).catch(() => 0);
    await browser.storage.local.set({ tokenBal: convertToAE(balance).toFixed(3) });
    commit(types.UPDATE_BALANCE, convertToAE(balance));
  },
  popupAlert({ commit }, payload) {
    switch (payload.name) {
      case 'spend':
        switch (payload.type) {
          case 'insufficient_balance':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.INSUFFICIENT_BALANCE });
            break;
          case 'confirm_transaction':
            commit(types.SHOW_POPUP, {
              show: true,
              class: payload.type,
              data: payload.data,
              secondBtn: true,
              secondBtnClick: 'confirmTransaction',
              ...popupMessages.CONFIRM_TRANSACTION,
            });
            break;
          case 'success_transfer':
            commit(types.SHOW_POPUP, { show: true, secondBtn: true, secondBtnClick: 'showTransaction', ...popupMessages.SUCCESS_TRANSFER, msg: payload.msg, data: payload.data });
            break;
          case 'success_deploy':
            commit(types.SHOW_POPUP, {
              show: true,
              secondBtn: true,
              secondBtnClick: 'copyAddress',
              buttonsTextSecondary: 'Copy address',
              ...popupMessages.SUCCESS_DEPLOY,
              msg: payload.msg,
              data: payload.data,
              noRedirect: payload.noRedirect,
            });
            break;
          case 'incorrect_address':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.INCORRECT_ADDRESS });
            break;
          case 'tx_limit_per_day':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.TX_LIMIT_PER_DAY });
            break;
          case 'incorrect_amount':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.INCORRECT_AMOUNT });
            break;
          case 'transaction_failed':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.TRANSACTION_FAILED });
            break;
          case 'tx_error':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.TRANSACTION_FAILED, msg: payload.msg });
            break;
          case 'integer_required':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.INTEGER_REQUIRED });
            break;
          default:
            break;
        }
        break;
      case 'account':
        switch (payload.type) {
          case 'publicKeyCopied':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.PUBLIC_KEY_COPIED });
            break;
          case 'seedFastCopy':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.SEED_FAST_COPY });
            break;
          case 'requiredField':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.REQUIRED_FIELD });
            break;
          case 'added_success':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.SUCCESS_ADDED });
            break;
          case 'only_allowed_chars':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.CHARS_ALLOWED });
            break;
          case 'not_selected_val':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.NOT_SELECTED_VAL });
            break;
          case 'account_already_exist':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.ACCOUNT_ALREADY_EXIST });
            break;
          case 'invalid_number':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.REQUIRED_NUMBER });
            break;
          case 'airgap_created':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.AIRGAP_CREATED });
            break;
          case 'confirm_privacy_clear':
            commit(types.SHOW_POPUP, { show: true, secondBtn: true, secondBtnClick: 'clearPrivacyData', ...popupMessages.CONFIRM_PRIVACY_CLEAR });
            break;
          case 'ledger_support':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.LEDGER_SUPPORT });
            break;
          case 'ledger_account_error':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.LEDGER_ACCOUNT_ERROR });
            break;
          case 'reveal_seed_phrase_impossible':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.REVEAL_SEED_IMPOSSIBLE });
            break;
          case 'error_qrcode':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.ERROR_QRCODE, msg: payload.msg, data: payload.data });
            break;
          case 'tip_url_verified':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.TIP_URL_VERIFIED });
            break;
          default:
            break;
        }
        break;
      case 'network':
        switch (payload.type) {
          case 'confirm_remove':
            commit(types.SHOW_POPUP, {
              show: true,
              class: payload.type,
              data: payload.data,
              secondBtn: true,
              secondBtnClick: 'removeUserNetwork',
              ...popupMessages.REMOVE_USER_NETWORK,
            });
            break;
          case 'cannot_remove':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.REMOVE_USER_NETWORK_ACTIVE_ERROR });
            break;
          case 'name_exists':
            commit(types.SHOW_POPUP, { show: true, ...popupMessages.USER_NETWORK_EXISTS_ERROR });
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  },
  async fetchTransactions({ state }, { limit, page }) {
    if (!state.middleware) return [];
    const { middlewareUrl } = state.network[state.current.network];
    const { publicKey } = state.account;
    try {
      const tx = await fetch(`${middlewareUrl}/middleware/transactions/account/${publicKey}?page=${page}&limit=${limit}`, {
        method: 'GET',
        mode: 'cors',
      });
      return tx.json();
    } catch (e) {
      return [];
    }
  },
  updateLatestTransactions({ commit }, payload) {
    commit(types.UPDATE_LATEST_TRANSACTIONS, payload);
  },
  setAccountName({ commit }, payload) {
    commit(types.SET_ACCOUNT_NAME, payload);
  },
  initSdk({ commit }, payload) {
    commit(types.INIT_SDK, payload);
  },
  async getRegisteredNames({ commit, state }) {
    if (!state.middleware) return;
    const { middlewareUrl } = state.network[state.current.network];
    const res = await Promise.all(
      state.subaccounts.map(async ({ publicKey }, index) => {
        if (publicKey) {
          let names = await Promise.all([
            (async () =>
              (await state.sdk.api.getPendingAccountTransactionsByPubkey(publicKey).catch(() => ({ transactions: [] }))).transactions
                .filter(({ tx: { type } }) => type === 'NameClaimTx')
                .map(({ tx, ...otherTx }) => ({
                  ...otherTx,
                  ...tx,
                  pending: true,
                  owner: tx.accountId,
                })))(),
            (async () => uniqBy(await (await fetch(`${middlewareUrl}/middleware/names/reverse/${publicKey}`)).json(), 'name'))(),
            (async () => {
              try {
                return await state.middleware.getActiveNames({ owner: publicKey });
              } catch (e) {}
              return [];
            })(),
          ]);
          names = flatten(names);
          names = uniqBy(names, 'name');
          if (!process.env.RUNNING_IN_TESTS) {
            if (names.length) {
              commit(types.SET_ACCOUNT_AENS, { account: index, aename: names[0].name, pending: !!names[0].pending });
            } else {
              commit(types.SET_ACCOUNT_AENS, { account: index, aename: null, pending: false });
            }
          }
          return names;
        }
        return [];
      })
    );
    await browser.storage.local.set({ subaccounts: state.subaccounts.filter(s => s.publicKey) });
    commit(types.SET_NAMES, { names: Array.prototype.concat.apply([], res) });
  },
  async fetchAuctionEntry({ state: { sdk } }, name) {
    const { info, bids } = await sdk.middleware.getAuctionInfoByName(name);
    return {
      ...info,
      bids: bids.map(({ tx }) => ({
        ...tx,
        nameFee: BigNumber(aettosToAe(tx.nameFee)),
      })),
    };
  },
  async removePendingName({ commit, state }, { hash }) {
    let pending = state.pendingNames;
    pending = pending.filter(p => p.hash !== hash);
    await browser.storage.local.set({ pendingNames: { list: pending } });
    commit(types.SET_PENDING_NAMES, { names: pending });
    await new Promise(resolve => setTimeout(resolve, 1500));
  },

  unlockWallet(context, payload) {
    return postMessage({ type: 'unlockWallet', payload });
  },

  async getAccount(context, { idx }) {
    return (await postMessage({ type: 'getAccount', payload: { idx } })).address;
  },

  async getKeyPair({ state: { account } }, { idx }) {
    const { publicKey, secretKey } = parseFromStorage(
      await postMessage({
        type: 'getKeypair',
        payload: { activeAccount: idx, account: { publicKey: account.publicKey } },
      })
    );
    return { publicKey, secretKey };
  },

  async generateWallet(context, { seed }) {
    return (await postMessage({ type: 'generateWallet', payload: { seed: stringifyForStorage(seed) } })).address;
  },

  async setLogin({ commit, dispatch }, { keypair }) {
    await browser.storage.local.set({ userAccount: keypair, isLogged: true, termsAgreed: true });

    const sub = [];
    sub.push({
      name: 'Main Account',
      publicKey: keypair.publicKey,
      balance: 0,
      root: true,
      aename: null,
    });
    await browser.storage.local.set({ subaccounts: sub, activeAccount: 0 });
    commit('SET_ACTIVE_ACCOUNT', { publicKey: keypair.publicKey, index: 0 });
    await dispatch('setSubAccounts', sub);
    commit('UPDATE_ACCOUNT', keypair);
    commit('SWITCH_LOGGED_IN', true);
    // router.push('/account');
  },
  async getPendingTxs({ state: { current }, commit }) {
    const { pendingTxs } = await browser.storage.local.get('pendingTxs');
    let txs = [];
    if (pendingTxs && pendingTxs.length) {
      txs = pendingTxs.map(el => {
        const { time, domain } = el;
        const amount = parseFloat(el.amount).toFixed(3);
        const amountCurrency = parseFloat(current.currencyRate ? amount * current.currencyRate : amount).toFixed(3);
        return { ...el, amount, time, amountCurrency, domain };
      });
    }
    commit('SET_PENDING_TXS', txs);
  },
  async checkPendingTxMined({ commit, state: { sdk } }) {
    const { pendingTxs } = await browser.storage.local.get('pendingTxs');
    if (pendingTxs && pendingTxs.length) {
      pendingTxs.forEach(async ({ hash, type, amount, domain }) => {
        const mined = await sdk.poll(hash);
        if (mined) {
          const pending = pendingTxs.filter(p => p.hash !== hash);
          browser.storage.local.set({ pendingTxs: pending });
          commit('SET_PENDING_TXS', pending);
          if (type === 'tip') {
            return router.push({ name: 'success-tip', params: { amount, domain } });
          }
          if (type === 'spend') {
            return router.push({ name: 'send', params: { redirectstep: 3, successtx: mined } });
          }
        }
        return false;
      });
    }
  },
  async checkExtensionUpdate({ state: { network } }) {
    const { tipContract } = network[DEFAULT_NETWORK];
    let update = false;
    try {
      const { contractAddress } = await (await fetch(`${BACKEND_URL}/static/contract`)).json();
      if (tipContract !== contractAddress) update = true;
    } catch (e) {
      update = false;
    }

    return update;
  },
  async checkBackupSeed() {
    // eslint-disable-next-line camelcase
    const { backed_up_Seed } = await browser.storage.local.get('backed_up_Seed');
    // eslint-disable-next-line camelcase
    if (!backed_up_Seed) return false;

    return true;
  },
  async setNotificationsSeen({ commit }, payload) {
    await browser.storage.local.set({ notificationsSeen: payload });
    commit(types.SET_NOTIFICATIONS_SEEN, payload);
  },
  async getNotificationsSeen({ commit }) {
    const { notificationsSeen } = await browser.storage.local.get('notificationsSeen');
    commit(types.SET_NOTIFICATIONS_SEEN, notificationsSeen);
    return (!notificationsSeen) ? 0 : notificationsSeen;
  },
};
