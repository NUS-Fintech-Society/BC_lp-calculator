import React, { Component } from "react";
import styled from "styled-components";
import { getETHPriceInUSD, getGasFeesInUSD } from "./api/API";
import getBollingerBand from "./api/bollingerBand";
import getTickerHistoricalMinMaxPrice from "./api/priceHistoryApi";
import { StrategyEnum, FrequencyEnum } from "./Components/dropdown-List/dropdownList";
import "./App.css";
import CalculatorForm from "./Components/calculator-form/calculatorForm";
import NavBar from "./Components/navbar";
import ResultArea from "./Components/result-area/resultArea";
import { getAmountToProvide, getUSDCForETH } from "./api/uniswapSdk";
import ResultSpinner from "./Components/result-area/resultSpinner";

const AppWrapper = styled.div`
    height: 100vh;
    width: 100vw;
`;

class App extends Component {
    constructor() {
        super();
        this.state = {
            amount: 5000,
            numOfMonths: 12,
            token1Count: 0,
            token2Count: 0,
            minRange: 0,
            maxRange: 0,
            gasFeesInUSD: 0,
            gasPercent: 0,
            tokenPair: "ETH/USDC",
            LPPoolFee: "0.3%",
            strategy: StrategyEnum.minMax,
            bollingerBandFrequencyType: FrequencyEnum.daily,
            bollingerBandFrequencyValue: 50,
            token2Name: "USDC",
            loading: true,
        };
    }

    compo;

    componentDidMount() {
        // Initial Calculation based on default fields
        // getAmountToProvide(5000, 1000, 3000, 500, 15).then(console.log);
        this.updateRecommendation();
    }

    async calculateAmountToProvide(capital, lower, upper, gasFee) {
        const amount = capital - gasFee;
        const USDCPriceFor1Eth = await getUSDCForETH(1, lower, upper, 3000);
        const OneEthPrice = await getETHPriceInUSD();
        const totalAmt = parseFloat(USDCPriceFor1Eth + OneEthPrice);
        const amtOfEthNeeded = parseFloat(amount / totalAmt).toFixed(3);
        const amtOfUSDCNeeded = amtOfEthNeeded * USDCPriceFor1Eth;
        return { ETH: amtOfEthNeeded, USDC: amtOfUSDCNeeded };
    }

    onInputChange = (event) => {
        this.setState({ [event.target.id]: parseFloat(event.target.value) });
    };

    onDropDownChange = (event) => {
        this.setState({ [event.target.id]: event.target.value });
    };

    onRecommendationBtnClick = () => {
        this.setState({ loading: true });
        this.updateRecommendation();
    };

    async updateRecommendation() {
        const {
            amount,
            numOfMonths,
            tokenPair,
            strategy,
            bollingerBandFrequencyType,
            bollingerBandFrequencyValue,
        } = this.state;

        var minRange = 0,
            maxRange = 0;

        const token1Name = tokenPair.split("/")[0];
        const token2Name = tokenPair.split("/")[1];

        const gasFeesInUSD = parseFloat((await getGasFeesInUSD()).toFixed(2));
        const gasPercent = parseFloat(((gasFeesInUSD / amount) * 100).toFixed(2));

        if (strategy === StrategyEnum.minMax) {
            const tokenMinMaxPrice = await getTickerHistoricalMinMaxPrice(
                token1Name,
                token2Name,
                numOfMonths
            );
            minRange = tokenMinMaxPrice["running_min"];
            maxRange = tokenMinMaxPrice["running_max"];
        } else if (strategy === StrategyEnum.bollingerBand) {
            const finalBBFrequencyValue =
                parseInt(bollingerBandFrequencyType) === FrequencyEnum.daily
                    ? bollingerBandFrequencyValue
                    : bollingerBandFrequencyValue * 24;

            const result = await getBollingerBand(
                token1Name,
                token2Name,
                parseInt(bollingerBandFrequencyType),
                finalBBFrequencyValue
            );

            if (result === -1) {
                alert(
                    "The application has returned an error, maybe try lower the number of days and try again later."
                );
                return;
            }

            minRange = Math.max(parseFloat(result["lower_bollinger_band"]).toFixed(2), 0);
            maxRange = parseFloat(result["upper_bollinger_band"]).toFixed(2);
        }
        const investAmtResult = await this.calculateAmountToProvide(
            5000,
            parseInt(minRange),
            parseInt(maxRange),
            gasFeesInUSD
        );

        const token1Count = parseFloat(investAmtResult["ETH"]).toFixed(3);
        const token2Count = parseFloat(investAmtResult["USDC"]).toFixed(3);

        const loading = false;

        this.setState({
            gasFeesInUSD,
            gasPercent,
            minRange,
            maxRange,
            token1Count,
            token2Count,
            token2Name,
            loading,
        });
    }

    render() {
        const {
            amount,
            numOfMonths,
            tokenPair,
            LPPoolFee,
            strategy,
            bollingerBandFrequencyType,
            bollingerBandFrequencyValue,
            loading,
        } = this.state;

        return (
            <AppWrapper>
                <NavBar />
                <div id="body">
                    <div id="calculatorForm" className="shadow p-3 mb-5 bg-white rounded">
                        <CalculatorForm
                            onInputChange={this.onInputChange}
                            onDropDownChange={this.onDropDownChange}
                            amount={amount}
                            numOfMonths={numOfMonths}
                            tokenPair={tokenPair}
                            LPPoolFee={LPPoolFee}
                            strategy={strategy}
                            bollingerBandFrequencyType={bollingerBandFrequencyType}
                            bollingerBandFrequencyValue={bollingerBandFrequencyValue}
                        />
                        <button
                            type="button"
                            id="recommendationBtn"
                            className="btn btn-primary btn-lg"
                            onClick={this.onRecommendationBtnClick}
                        >
                            Get Recommendation
                        </button>
                    </div>
                    {loading ? <ResultSpinner /> : <ResultArea {...this.state} />}
                </div>
            </AppWrapper>
        );
    }
}

export default App;
