<template>
  <Component
    :is="to ? 'RouterLink' : 'button'"
    :to="to"
    class="primary-button"
    @click="$emit('click')"
    :class="{ disabled, extend, half, small, onboarding, dark }"
  >
    <slot />
  </Component>
</template>

<script>
export default {
  props: {
    disabled: Boolean,
    extend: Boolean,
    half: Boolean,
    small: Boolean,
    third: Boolean,
    onboarding: Boolean,
    dark: Boolean,
    to: [String, Object],
  },
};
</script>

<style lang="scss">
@import '../../../common/variables';

.primary-button {
  display: block;
  text-decoration: none;
  background: $button-color !important;
  width: 270px !important;
  border-radius: 5px;
  font-family: 'Roboto', sans-serif;
  font-size: 15px;
  padding: 0;
  margin: 8px auto;
  color: $button-text-color !important;
  font-weight: normal !important;
  line-height: 40px !important;
  max-height: 40px;
}
.primary-button span {
  color: $button-text-color !important;
}
.primary-button.disabled {
  opacity: 0.4;
  pointer-events: none;
}
.primary-button.extend {
  // width: 304px !important;
  width: 100% !important;
}
.primary-button.half {
  // width: 148px !important;
  width: 48% !important;
  margin: 0 !important;
}
.primary-button.dark {
  background: $box-button-color !important;
}
.primary-button.small {
  width: auto !important;
  line-height: 1px !important;
  padding: 10px;
  font-size: 12px;
}
.primary-button.third {
  width: 32% !important;
  margin: 0 !important;
  max-height: 100px;
  line-height: normal !important;
  padding: 5px;
  word-break: break-word;
}
.primary-button.small.third {
  font-size: 12px;
}
.primary-button.confirm,
.primary-button.danger {
  background: $secondary-color !important;
  color: $white-color !important;
}
.primary-button.onboarding {
  width: 100px !important;
  font-size: 14px;
  height: 34px;
  border-radius: 5px;
  line-height: 34px !important;
  background: $box-button-color !important;
  margin: 0 !important;
  margin-right: 10px !important;
  font-weight: 500 !important;
  color: #fff !important;

  &:last-child {
    margin-right: 0 !important;
  }

  &.skip {
    background: #ff5857 !important;
  }

  &.next {
    background: $secondary-color !important;
  }

  &.start {
    margin-left: auto !important;
    margin-right: 0 !important;
    background: $secondary-color !important;
  }
}
</style>
