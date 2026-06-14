// https://eslint.nuxt.com/packages/module

// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import vuejsAccessibility from 'eslint-plugin-vuejs-accessibility'

export default withNuxt(
    {
        rules: {
            'vue/attribute-hyphenation': 'off',
            'vue/no-multiple-template-root': 'off',
            'vue/require-default-prop': 'off',
            'vue/multi-word-component-names': 'off',
            'vue/v-on-event-hyphenation': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },
    ...vuejsAccessibility.configs['flat/recommended'],
    {
        rules: {
            'vuejs-accessibility/alt-text': 'warn',
            'vuejs-accessibility/anchor-has-content': 'warn',
            'vuejs-accessibility/aria-props': 'warn',
            'vuejs-accessibility/aria-role': 'warn',
            'vuejs-accessibility/aria-unsupported-elements': 'warn',
            'vuejs-accessibility/click-events-have-key-events': 'warn',
            'vuejs-accessibility/form-control-has-label': 'warn',
            'vuejs-accessibility/heading-has-content': 'warn',
            'vuejs-accessibility/iframe-has-title': 'warn',
            'vuejs-accessibility/interactive-supports-focus': 'warn',
            'vuejs-accessibility/label-has-for': 'warn',
            'vuejs-accessibility/media-has-caption': 'warn',
            'vuejs-accessibility/mouse-events-have-key-events': 'warn',
            'vuejs-accessibility/no-access-key': 'warn',
            'vuejs-accessibility/no-autofocus': 'warn',
            'vuejs-accessibility/no-distracting-elements': 'warn',
            'vuejs-accessibility/no-redundant-roles': 'warn',
            'vuejs-accessibility/no-static-element-interactions': 'warn',
            'vuejs-accessibility/role-has-required-aria-props': 'warn',
            'vuejs-accessibility/tabindex-no-positive': 'warn',
        },
    },
)
