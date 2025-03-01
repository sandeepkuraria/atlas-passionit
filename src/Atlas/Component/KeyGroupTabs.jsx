import { useEffect, useState } from "react";
import * as API from "../Endpoint/Endpoint";

const KeyGroupTabs = () => {
  const [keygroups, setKeygroups] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedKeygroup, setSelectedKeygroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const itemsPerPage = 1; // Articles per page
  // Toggle Dropdown
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Fetch keygroups from the backend
  useEffect(() => {
    const fetchKeyGroups = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API.BASE_URL}keygroups`);
        const data = await response.json();
        setKeygroups(data);
      } catch (error) {
        console.error("🚨 Error fetching keygroups:", error);
        setError("Failed to load keygroups.");
      } finally {
        setLoading(false);
      }
    };
    fetchKeyGroups();
  }, []);

  // Fetch data for a specific keygroup
  const fetchKeygroupData = async (keygroupId, keygroupName) => {
    try {
      setLoading(true);
      const response = await fetch(`${API.BASE_URL}keygroup/${keygroupId}`);
      const data = await response.json();
      setReportData(data);
      setSelectedKeygroup(keygroupName);
      setShowModal(true);
      setDropdownOpen(false); // Close dropdown when item is selected
    } catch (error) {
      console.error("🚨 Error fetching KeyGroup data:", error);
      setError("Failed to load KeyGroup data.");
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination
  // const paginatedNews = reportData?.news.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );
  const paginatedNews = reportData?.news.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Group dimensions by category
  const groupDimensionsByCategory = (articleId) => {
    const grouped = {
      "Passion Dimensions": [],
      "PRUTL Positive Soul Dimensions": [],
      "PRUTL Negative Soul Dimensions": [],
      "Positive Materialism Dimensions": [],
      "Negative Materialism Dimensions": [],
    };

    reportData.dimensions
      .filter((dim) => dim.article_id === articleId)
      .forEach((dim) => {
        if (dim.category in grouped) {
          grouped[dim.category].push(dim);
        }
      });

    return grouped;
  };

  // Dimension Table Component
  const DimensionTable = ({ title, dimensions }) => (
    <div className="mt-6">
      <h3 className="text-xl font-semibold text-[#e27c34] mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-collapse border-gray-300 mt-3">
          <thead>
            <tr className="bg-[#fdf2d1]">
              <th className="border px-4 py-2">Dimension</th>
              <th className="border px-4 py-2 whitespace-nowrap">
                Score
              </th>
              <th className="border px-4 py-2">Evidence Found</th>
              <th className="border px-4 py-2">Rationale for Score</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {dimensions.map((dim, index) => (
              <tr
                key={dim.dimension_id}
                className={index % 2 === 0 ? "border" : "border bg-gray-50"}
              >
                <td className="border px-4 py-2">{dim.dimension_name}</td>
                <td className="border px-4 py-2">{dim.score}</td>
                <td className="border px-4 py-2">{dim.evidence}</td>
                <td className="border px-4 py-2">{dim.rationale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-[#fbf9ef] min-h-screen">
      <h1 className="text-4xl font-bold text-[#e27c34] mb-8">KeyGroups</h1>

      {error && <p className="text-red-600">{error}</p>}
      {loading && <p className="text-blue-500">Loading...</p>}

      {/* KeyGroup Dropdown */}
      <div className="relative mb-8">
        <button
          onClick={toggleDropdown}
          className="bg-orange-400 text-white w-40 py-3 rounded-lg hover:bg-orange-500 transition whitespace-nowrap"
        >
          Select KeyGroup
        </button>

        {dropdownOpen && (
          <div className="absolute mt-2 w-52 shadow-lg rounded-lg z-50 max-h-96 overflow-y-auto">
            {keygroups.map((group) => (
              <button
                key={group.keygroup_id}
                onClick={() =>
                  fetchKeygroupData(group.keygroup_id, group.keygroup_name)
                }
                className="block w-full text-left px-4 py-2 my-1"
              >
                {group.keygroup_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showModal && reportData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center p-0">
          <div className="bg-white max-w-7xl w-full p-8 shadow-lg overflow-auto max-h-screen relative">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-3xl font-thin text-[#fffff] hover:text-[#8b8888] bg-orange-400 hover:bg-orange-500"
            >
              &times;
            </button>

            {/* Modal Header */}
            <h2 className="text-3xl font-bold text-[#e27c34] mb-4">
              {selectedKeygroup}
            </h2>

            {paginatedNews.map((article) => {
              const groupedDimensions = groupDimensionsByCategory(
                article.article_id
              );
              return (
                <div key={article.article_id} className="mb-8">
                  <h3 className="text-2xl font-semibold bg-[#d62101] text-white p-3 rounded mb-4">
                    {selectedKeygroup} - {article.keyword_name}
                  </h3>
                  <p>
                    <strong>Link:</strong>{" "}
                    <a
                      href={article.link}
                      className="text-blue-500"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {article.link}
                    </a>
                  </p>
                  <p className="text-gray-700 mt-2">
                    <strong>Text:</strong> {article.text}
                  </p>
                  <p className="text-gray-700">
                    {article.news_release_time && (
                      <p>
                        <strong>Date:</strong> {article.news_release_time}
                      </p>
                    )}
                  </p>

                  {/* Render all Dimension Tables */}
                  {Object.entries(groupedDimensions).map(
                    ([category, dimensions]) =>
                      dimensions.length > 0 && (
                        <DimensionTable
                          key={category}
                          title={category}
                          dimensions={dimensions}
                        />
                      )
                  )}
                </div>
              );
            })}

            {/* Pagination Controls */}
            <div className=" flex justify-between sticky bottom-0 bg-white">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 bg-orange-400 rounded ${
                  currentPage === 1
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-orange-500"
                }`}
              >
                Previous
              </button>

              <span className="px-4 py-2">
                Page {currentPage} of{" "}
                {Math.ceil(reportData.news.length / itemsPerPage)}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(reportData.news.length / itemsPerPage)
                    )
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(reportData.news.length / itemsPerPage)
                }
                className={`px-4 py-2 bg-orange-400 rounded ${
                  currentPage ===
                  Math.ceil(reportData.news.length / itemsPerPage)
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-orange-500"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyGroupTabs;
