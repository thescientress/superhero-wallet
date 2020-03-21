import Vue from 'vue';
import Vuex from 'vuex';
import { DEFAULT_NETWORK, networks } from '../popup/utils/constants';
import { POPUP_PROPS } from '../popup/utils/popup-messages';
import actions from './actions';
import { getters } from './getters';
import mutations from './mutations';


Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    subaccounts: [],
    account: {},
    activeAccount: 0,
    names: [],
    pendingNames: [],
    wallet: [],
    balance: 0,
    current: {
      network: DEFAULT_NETWORK,
      language: '',
      token: 0,
      currency: 'usd',
      currencyRate: 0,
    },
    network: networks,
    userNetworks: [],
    popup: Object.assign({}, POPUP_PROPS),
    isLoggedIn: false,
    transactions: {
      latest: [],
      pending: [],
    },
    sdk: null,
    middleware: null,
    aeppPopup: false,
    ledgerApi: null,
    txAdvancedMode: false,
    tipping: null,
    tippingReceiver: {},
    mainLoading: true,
    nodeStatus: 'connecting',
    currencies: {},
    notifications: [],
    notificationsSeen: 0,
  },
  getters,
  mutations,
  actions,
  plugins: [],
});
