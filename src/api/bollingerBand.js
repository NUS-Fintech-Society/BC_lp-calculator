import axios from "axios";

/**
 * Returns the upper and lower bollingerband values for some crypto_ticker1 in crypto_ticker2's value
 * @param {String} crypto_ticker1 the ticker symbol of the crypto in interest
 * @param {String} crypto_ticker2 the ticker symbol who's value is used as reference
 * Refer to
 * https://min-api.cryptocompare.com/documentation?key=Historical&cat=dataHistoday for the full
 * list of ticker list acceptable
 * @param {n value in days} data_points number of days of data to use to generate the bollingerband
 * @param {number of standard deviations} num_std_dev number of standard deviations for the bollinger band
 * @param {int} timeframe_type 0 will be for daily, 1 will be for hourly and 2 will be for minute timeframe
 * @returns
 */
export default async function getBollingerBand(
    crypto_ticker1,
    crypto_ticker2,
    timeframe_type = 0,
    data_points = 20,
    num_std_dev = 2
) {
    if (!Number.isInteger(data_points) || data_points < 1) {
        // console.log("error 1");
        return -1;
    }
    if (timeframe_type !== 0 && timeframe_type !== 1 && timeframe_type !== 2) {
        // console.log("error 2");
        return -1;
    }
    let base_api_url = "https://min-api.cryptocompare.com/data/v2/";
    switch (timeframe_type) {
        case 1:
            base_api_url += "histohour?";
            break;
        case 2:
            base_api_url += "histominute?";
            break;
        default:
            base_api_url += "histoday?";
            break;
    }
    base_api_url += "fsym=" + crypto_ticker1;
    base_api_url += "&tsym=" + crypto_ticker2;
    base_api_url += "&aggregate=1";
    base_api_url += "&limit=" + data_points;
    base_api_url += "&api_key=cc61fbdbd2735f2b9f844da1ef6f06f35da34427fec26a9549878a8041547624";
    const response = await axios.get(base_api_url);
    if (response["data"]["Response"] !== "Success") {
        // console.log("error 3");
        return -1;
    }
    let data = response["data"]["Data"]["Data"];
    let tp_list = [];
    for (var i = data_points - 1; i >= 0; i--) {
        let tp = (data[i]["high"] + data[i]["low"] + data[i]["close"]) / 3;
        // console.log("Current tp: ", tp);
        tp_list.push(tp);
    }
    let moving_avg = calcMovingAverage(tp_list);
    let standard_dev = calcStandardDeviation(tp_list, moving_avg);
    let upper_bollinger_band = moving_avg + num_std_dev * standard_dev;
    let lower_bollinger_band = moving_avg - num_std_dev * standard_dev;
    let result = { upper_bollinger_band, lower_bollinger_band };
    // console.log("This is the result: ", result);
    return result;
}

function calcMovingAverage(data_list) {
    if (data_list.length === 0) {
        return 0;
    }
    let sum = 0;
    for (var i = 0; i < data_list.length; i++) {
        sum += data_list[i];
    }
    return sum / data_list.length;
}

function calcStandardDeviation(data_list, moving_avg = -1) {
    if (data_list.length === 0) {
        return 0;
    }
    if (moving_avg === -1) {
        moving_avg = calcMovingAverage(data_list);
    }
    let temp = 0;
    for (var i = 0; i < data_list.length; i++) {
        temp += Math.pow(data_list[i] - moving_avg, 2);
    }
    temp /= data_list.length;
    return Math.sqrt(temp);
}
