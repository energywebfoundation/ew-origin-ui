import { Supply } from 'ew-market-lib';
import { Actions } from '../features/actions';

const defaultState = [];

export default function reducer(state = defaultState, action) {
    if (action.type === Actions.supplyCreatedOrUpdated) {
        const supplyIndex = state.findIndex((d: Supply.Entity) => d.id === action.supply.id);

        return supplyIndex === -1 ? [...state, action.supply] : [...state.slice(0, supplyIndex), action.supply, ...state.slice(supplyIndex + 1)];
    } else {
        return state;
    }
}
