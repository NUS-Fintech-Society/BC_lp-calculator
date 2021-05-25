import axios from "axios"

// API from: https://min-api.cryptocompare.com/documentation?key=Historical&cat=dataHistoday

/**
 * Retrieves the maximum price of crypto based on the historical data over the past months
 * using cryptocompare api
 * @param {String} crypto_ticker the ticker symbol of the crypto. Refer to 
 * https://min-api.cryptocompare.com/documentation?key=Historical&cat=dataHistoday for the full
 * list of ticker list acceptable
 * @param {Integer} num_months the number of past months data over which to determine min and max price.
 * Default value is 1
 * @returns a list containing the minimum and maximum price of the crypto ticker over the past 
 * number of months
 */
export async function getTickerHistoricalMinMaxPrice(crypto_ticker, num_months=1){
    if(!Number.isInteger(num_months) || num_months < 1){
        return -1
    }
    let base_api_url = "https://min-api.cryptocompare.com/data/v2/histoday?"
    base_api_url += "fsym=" + crypto_ticker
    base_api_url += "&tsym=USD"
    base_api_url += "&aggregate=30"
    base_api_url += "&limit=" + num_months
    base_api_url += "&api_key=cc61fbdbd2735f2b9f844da1ef6f06f35da34427fec26a9549878a8041547624"
    const response = await axios.get(base_api_url)
    if(response["data"]["Response"] !== "Success"){
        return -1
    }
    let data = response["data"]["Data"]["Data"]
    let running_max = Number.NEGATIVE_INFINITY
    let running_min = Number.POSITIVE_INFINITY
    for(var i = 0; i <= num_months; i++){
        if(data[i]["high"] > running_max){
            running_max = data[i]["high"]
        }
        if(data[i]["low"] < running_min){
            running_min = data[i]["low"]
        }
    }
    let result = {running_min, running_max}
    return result
}

