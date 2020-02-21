import React from "react";

export default class Thanks extends React.Component {
  static stepName = "Thanks";
  render() {
    return (
      <div className="finished">
        <div>
          <h4>Finished!</h4>
          <p>Thank you for participating!</p>
        </div>
      </div>
    );
  }
}
