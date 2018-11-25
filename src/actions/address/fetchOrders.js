import { ADDRESS_FETCH_ORDERS } from "./actions";
import { LAYOUT_RAISE_ERROR } from "../layout/actions";

import { history } from "../../store";

import { convertOrders } from "../../helpers/convertOrders";

export const fetchOrders = () => (dispatch, getState) => {

        const {addressHashed, addressType} = getState().address;

        if(addressHashed && addressType) {

            const contracts = getState().switcheo.contracts[addressType];
            const network = getState().switcheo.network;

            if(contracts) {

                fetchOrdersFromContracts(addressHashed, Object.values(contracts), network)
                    .then((orders) => {

                        //merge orders from multiple contracts
                        orders = [].concat.apply([], orders);
                        orders = convertOrders(orders, getState().switcheo.tokens, getState().switcheo.contracts);

                        dispatch({
                            type: ADDRESS_FETCH_ORDERS,
                            orders
                        });

                    })
                    .catch((err) => {
                        dispatch({
                            type: LAYOUT_RAISE_ERROR,
                            message: `Could not fetch orders: ${err.message}`
                        });
                        history.push("/")
                    })

            } else {

                dispatch({
                    type: LAYOUT_RAISE_ERROR,
                    message: `Could not fetch orders: No contracts available for ${addressType}`
                });
                history.push("/")

            }

        } else {
            dispatch({
                type: LAYOUT_RAISE_ERROR,
                message: 'Could not fetch orders: No address is given'
            })
            history.push("/")
        }
};

/**
 * Fetches orders made by address from a single contract
 * @param addressHashed
 * @param contractHash
 * @param network
 * @returns {Promise<Response>}
 */
const fetchOrdersFromContract = async (addressHashed, contractHash, network) => {

    const requestUrl = `https://${network}.switcheo.network/v2/orders?address=${addressHashed}&contract_hash=${contractHash}`;
    return await fetch(requestUrl).then(res => res.json())

};

/**
 * Fetches orders from the given contract hashes
 * @param addressHashed
 * @param contractHashes
 * @param network
 * @returns {Promise<any[]>}
 */
const fetchOrdersFromContracts = async (addressHashed, contractHashes, network) => {
    return Promise.all(contractHashes.map((async(contractHash) => {
        /*await fetchOrdersFromContract(addressHashed, contractHash, network)
            .then((orders) => {
               if(orders) {
                   return orders
               }
            });*/

        return await fetchOrdersFromContract(addressHashed, contractHash, network)
    })))
};