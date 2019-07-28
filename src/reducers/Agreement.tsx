import { Agreement } from 'ew-market-lib';
import { Actions } from '../features/actions';

const defaultState = [];

export default function reducer(state = defaultState, action) {
    if (action.type === Actions.agreementCreatedOrUpdated) {
        const agreementIndex = state.findIndex((d: Agreement.Entity) => d.id === action.agreement.id);

        return agreementIndex === -1 ? [...state, action.agreement] : [...state.slice(0, agreementIndex), action.agreement, ...state.slice(agreementIndex + 1)];
    } else {
        return state;
    }
}
