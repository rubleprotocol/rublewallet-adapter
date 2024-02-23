import { Button } from './Button.js';
import { ButtonProps } from './Button.js';
import { useWalletModal } from './useWalletModal.js';
import { defineComponent } from 'vue';

export const WalletSelectButton = defineComponent({
    props: ButtonProps,
    emits: ['click'],
    setup(props, { slots }) {
        const { visible, setVisible } = useWalletModal();
        const handleClick = () => {
            let preventDefault = false;
            if (props.onClick) {
                preventDefault = props.onClick();
            }
            if (!preventDefault) setVisible(!visible.value);
        };
        return () => (
            <Button {...props} data-testid="wallet-select-button" onClick={handleClick}>
                {slots.default ? slots.default() : 'Select Wallet'}
            </Button>
        );
    },
});