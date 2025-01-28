import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  paginate,
  maxPageNumbersToShow = 3,
}) => {
  const startPage = Math.max(
    2,
    currentPage - Math.floor(maxPageNumbersToShow / 2)
  );
  const endPage = Math.min(
    totalPages - 1,
    startPage + maxPageNumbersToShow - 1
  );

  return (
    <nav aria-label="Page navigation example">
      <ul className="pagination">
        {currentPage > 1 && (
          <li className="page-item">
            <button className="page-link" onClick={() => paginate(1)}>
              1
            </button>
          </li>
        )}
        {startPage > 2 && (
          <li className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        )}
        {Array.from({ length: endPage - startPage + 1 }, (_, index) => (
          <li
            key={index + startPage}
            className={`page-item ${
              currentPage === index + startPage ? "active" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => paginate(index + startPage)}
            >
              {index + startPage}
            </button>
          </li>
        ))}
        {endPage < totalPages - 1 && (
          <li className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        )}
        {currentPage < totalPages && (
          <li className="page-item">
            <button className="page-link" onClick={() => paginate(totalPages)}>
              {totalPages}
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;
