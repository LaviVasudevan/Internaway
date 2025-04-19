import React from "react";
import { useNavigate } from "react-router-dom";

const TableDisplay = ({ headers, data, year }) => {
  const navigate = useNavigate();

  // Exclude the 4th (index 3) column
  const filteredHeaders = headers.filter((_, index) => index !== 3); 

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {filteredHeaders.map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((entry, i) => (
            <tr
              key={i}
              onClick={() => navigate(`/year${year}/details/${i}`)}
              style={{ cursor: "pointer" }}
            >
              {filteredHeaders.map((key, j) => (
                <td key={j}>{entry[key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableDisplay;
