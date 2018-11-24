import { SWITCHEO_FETCH_CONTRACTS } from './actions'
import { LAYOUT_RAISE_ERROR } from "../layout/actions";

/**
 * fetches all contracts from /v2/exchange/contracts
 * @returns {function(*, *): *}
 */
export const fetchContracts = () => (dispatch, getState) => {

    const requestUrl = `https://${getState().switcheo.network}.switcheo.network/v2/exchange/contracts`;

    fetch(requestUrl)
        .then(res => res.json())
        .then((contracts) => {
            return dispatch({
                type: SWITCHEO_FETCH_CONTRACTS,
                contracts,
            })
        })
        .catch((err) => {
            return dispatch({
                type: LAYOUT_RAISE_ERROR,
                message: err.message,
            })
        });

};
