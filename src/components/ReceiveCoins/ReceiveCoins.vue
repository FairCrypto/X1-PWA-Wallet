<template>
    <div>
        <h2 class="align-center" data-focus>Receive X1 Fastnet XN</h2>

        <f-card class="receive-coins f-card-double-padding">
            <ReceiveFTM />
        </f-card>
    </div>
</template>

<script>
import FCard from '../core/FCard/FCard.vue';
import ReceiveFTM from './ReceiveFTM.vue';
import { eventBusMixin } from '../../mixins/event-bus.js';
import { focusElem } from '@/utils/aria.js';
import { getUniqueId } from '@/utils';

const DEFAULT_COMPONENT = 'receive-f-t-m';

export default {
    name: 'ReceiveCoins',

    components: { FCard, ReceiveFTM },

    mixins: [eventBusMixin],

    props: {
        /** Start verify FTM account in ReceiveFTM component */
        verifyAccount: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            currentComponent: DEFAULT_COMPONENT,
            labelId: getUniqueId(),
            // keepAliveExclude: 'BlockchainPicker',
        };
    },

    computed: {
        currentComponentProperties() {
            switch (this.currentComponent) {
                case 'receive-f-t-m':
                    return {
                        verifyAccount: this.verifyAccount,
                    };
                case 'transaction-completing':
                    return {
                        receive: true,
                        tokenSwapData: this._data_,
                    };
                default:
                    return null;
            }
        },
    },

    created() {
        // temporary data
        this._data_ = null;

        this._eventBus.on('account-picked', this.onAccountPicked);
    },

    mounted() {
        focusElem(this.$el);
    },

    methods: {
        /**
         * @param {('opera'|'binance'|'ethereum')} _blockchain
         */
        onBlockchainPick(_blockchain) {
            switch (_blockchain) {
                case 'opera':
                    this.currentComponent = 'ReceiveFTM';
                    break;
                case 'binance':
                    this.currentComponent = 'ReceiveBNB';
                    break;
                case 'ethereum':
                    this.currentComponent = 'ReceiveETH';
                    break;
            }
        },

        /**
         * @param {Object} _data
         */
        onChangeComponent(_data) {
            this._data_ = _data.data;

            this.currentComponent = _data.to;

            this.$nextTick(() => {
                this._data_ = null;
            });
        },

        onAccountPicked() {
            const { currentComponent } = this;

            this.currentComponent = '';
            this.$nextTick(() => {
                this.currentComponent = currentComponent;
            });
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
