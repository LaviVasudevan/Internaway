import React from "react";
import "../styles/FilterPanel.css";

const FilterPanel = ({ headers, filters, onFilterChange }) => {
  const yesNoFields = [
    "Obtained Internship or Not",
    "Placement thru college / outside",
    "Research\n/Industry",
    "Abroad / India",
    "Signed Permission Letter, Offer Letter",
    "Completion Certificte",
    "Internship Report",
    "Student Feedback",
    "Employer Feedback"
  ];
  
  return (
    <div className="filters">
      {headers.map((header) => {
        if (header === "Title") return null; // 🚫 Skip Title field

        // dropdown for Verification Status
        if (header === "Verification Status") {
          return (
            <div key={header} className="filter">
              <label>{header}</label>
              <select
                onChange={(e) => onFilterChange(header, e.target.value)}
                value={filters[header] || ""}
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
                <option value="-">-</option>
              </select>
            </div>
          );
        }

        const isYesNoField = yesNoFields.includes(header);

        if (isYesNoField) {
          return (
            <div key={header} className="filter">
              <label>{header}</label>
              <select
                onChange={(e) => onFilterChange(header, e.target.value)}
                value={filters[header] || ""}
              >
                <option value="">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          );
        }

        // Numeric input for stipend
        if (header === "Stipend\n(In Rs.)") {
          return (
            <div key={header} className="filter">
              <label>{header}</label>
              <input
                type="number"
                value={filters[header] || ""}
                onChange={(e) => onFilterChange(header, e.target.value)}
              />
            </div>
          );
        }

        // Default: text input
        return (
          <div key={header} className="filter">
            <label>{header}</label>
            <input
              type="text"
              value={filters[header] || ""}
              onChange={(e) => onFilterChange(header, e.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default FilterPanel;
