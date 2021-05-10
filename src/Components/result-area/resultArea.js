import React from "react";
import "./resultArea.css";

const ResultArea = (props) => {
    console.log(props);
    return (
        <div className="resultContainer">
            <h2>Recommendation:</h2>
            <h4>Investment Amount</h4>
            <p>
                You will need <span className="investAmt">~ {props.token1} ETH</span> and{" "}
                <span className="investAmt">~{props.token2} USDC</span> to invest in the pair after
                deducting the gas fee of{" "}
                <span className="investAmt">
                    ~${props.gasFee}({props.gasPercent}% of the initial investment)
                </span>
                .
            </p>
            <h4>Possible range based on the chosen parameters</h4>
            <p>
                <span className="rangeValue">${props.minRange}</span> to{" "}
                <span className="rangeValue">${props.maxRange}</span>
            </p>
        </div>
    );
};

export default ResultArea;
