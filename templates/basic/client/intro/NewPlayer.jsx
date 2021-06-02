import React, { Component } from 'react'
import { Centered } from "meteor/empirica:core";

export default class NewPlayer extends Component {
  state = { id: "" };

  handleUpdate = event => {
    const { value, name } = event.currentTarget;
    this.setState({ [name]: value });
  };

  handleSubmit = event => {
    event.preventDefault();

    const { handleNewPlayer } = this.props;
    const { id } = this.state;
    handleNewPlayer(id);
  };

  render() {
    const { id } = this.state;

    return (
      <Centered>
        <div >
          <form onSubmit={this.handleSubmit}>
            <h1>Identification</h1>

            <p>
              Please enter your id:
                        </p>

            <input
              dir="auto"
              type="text"
              name="id"
              id="id"
              value={id}
              onChange={this.handleUpdate}
              required
              autoComplete="off"
            />

            <br />

            <p>
              <button type="submit">Submit</button>
            </p>

          </form>
        </div>
      </Centered>
    )
  }
}