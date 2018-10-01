import React from "react";

import TaskResponse from "./TaskResponse";
import TaskStimulus from "./TaskStimulus";

export default class Task extends React.Component {
  render() {
    return (
      <div className="task">
        <TaskStimulus {...this.props} />
        <TaskResponse {...this.props} />
      </div>
    );
  }
}
