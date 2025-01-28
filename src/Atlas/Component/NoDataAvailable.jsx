// NoDataAvailable.js
import React from "react";
import { FaInbox } from "react-icons/fa";

const NoDataAvailable = () => {
  return (
    <tr>
      <td colSpan="6" className="text-center">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <FaInbox size={50} style={{ opacity: 0.2 }} />
          <span>No Data Available</span>
        </div>
      </td>
    </tr>
  );
};

export default NoDataAvailable;
