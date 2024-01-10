<template>
    <div class="view-settings std-view">
        <main class="main">
            <h1>Settings</h1>

            <h2>X1 Wallet</h2>
            <settings-form />

            <!--            <h2>fUNI</h2>-->
            <!--            <f-uniswap-settings />-->

            <h2>Metamask</h2>
            <m-m-settings />

            <h2>Links</h2>
            <settings-links />
        </main>
    </div>
</template>

<script>
import SettingsForm from '@/components/forms/SettingsForm.vue';
import MMSettings from '@/components/mm/MMSettings/MMSettings.vue';
// import FUniswapSettings from '@/components/funi/FUniswapSettings/FUniswapSettings.vue';
import SettingsLinks from '@/views/Settings/SettingsLinks.vue';

export default {
    name: 'Settings',
    components: { SettingsLinks, MMSettings, SettingsForm },

    // components: { SettingsLinks, FUniswapSettings, MMSettings, SettingsForm },
};
</script>

<style lang="scss">
@import 'style';
</style>
