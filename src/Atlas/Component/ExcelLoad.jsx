import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import * as API from "../Endpoint/Endpoint";

const ExcelLoad = () => {
  const [excelData, setExcelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const headers = jsonData[0];
      const rows = jsonData.slice(1).map((row) =>
        headers.reduce((acc, header, index) => {
          acc[header] = row[index] || ""; // Map headers to row data
          return acc;
        }, {})
      );

      console.log("Excel Data Parsed:", rows);
      setExcelData(rows);
    };
    reader.readAsArrayBuffer(file);
  };

  const formatData = (data) => {
    const user_id = sessionStorage.getItem("user_id") || "default_id"; // Replace with actual user ID
    return data.map((row, index) => ({
      id: row["ID"] || `row-${index}`, // Use ID column or generate unique ID
      user_id,
      title: `<p>${row["Title"] || ""}</p>`,
      description: `<p>${row["Description"] || ""}</p>`,
      category: `<p>${row["Category"] || ""}</p>`,
      referenceLink: `<p>${row["Reference Link"] || ""}</p>`,
      videoRecommendations: `<p>${row["Video Recommendations"] || ""}</p>`,
      podcastRecommendations: `<p>${row["Podcast Recommendations"] || ""}</p>`,
      undiscoveredInnovation: `<p>${
        row["Undiscovered Possible Innovation"] || ""
      }</p>`,
      researchOpportunities: `<p>${row["Research Opportunities"] || ""}</p>`,
      patents: `<p>${row["Patents (if any)"] || ""}</p>`,
      lessonsToLearn: `<p>${row["Lessons to Learn"] || ""}</p>`,
      startups: `<p>${row["Startups in this Space"] || ""}</p>`,
      advertisementGallery: `<p>${row["Advertisement Gallery"] || ""}</p>`,
    }));
  };

  const mergeData = (existing, incoming) => {
    if (!existing) return incoming; // If there's no existing data, use the incoming data
    if (!incoming) return existing; // If there's no incoming data, keep the existing data
    return existing === incoming ? existing : incoming; // Update only if data is different
  };
  
  const updateOrAppendData = async (newData) => {
    const updatedData = [];
  
    for (const row of newData) {
      const { id } = row; // Ensure your data includes a unique ID field
      let existingDoc = null;
  
      try {
        console.log(`Fetching existing document for ID: ${id}`);
        const response = await axios.get(`${API.CLIENT_URL}/solr/research/select`, {
          params: { q: `id:${id}`, wt: "json" },
        });
  
        existingDoc = response.data.response.docs[0];
        console.log(`Existing document for ID ${id}:`, existingDoc);
  
        // Parse the `_src_` field if it exists
        const existingData = existingDoc?._src_ ? JSON.parse(existingDoc._src_) : {};
        console.log(`Parsed existing data for ID ${id}:`, existingData);
  
        // Merge existing and incoming data
        const mergedDoc = {
          id,
          user_id: row.user_id, // Always take the incoming `user_id`
          title: mergeData(existingData?.title, row.title),
          description: mergeData(existingData?.description, row.description),
          category: mergeData(existingData?.category, row.category),
          referenceLink: mergeData(existingData?.referenceLink, row.referenceLink),
          videoRecommendations: mergeData(
            existingData?.videoRecommendations,
            row.videoRecommendations
          ),
          podcastRecommendations: mergeData(
            existingData?.podcastRecommendations,
            row.podcastRecommendations
          ),
        };
  
        console.log("Merged Document:", mergedDoc);
        updatedData.push(mergedDoc);
      } catch (error) {
        console.error(`Error fetching document for ID ${id}:`, error);
      }
    }
  
    console.log("Updated Data Array:", updatedData);
    return updatedData;
  };

  const handleSubmit = async () => {
    if (!excelData.length) {
      toast.error("No data to submit.");
      return;
    }
    setLoading(true);

    try {
      const formattedData = formatData(excelData);
      console.log("Formatted Data for Submission:", formattedData);

      const finalData = await updateOrAppendData(formattedData);
      console.log("Final Data to Submit to Solr:", finalData);

      const response = await axios.post(
        `${API.CLIENT_URL}/solr/research/update/json/docs`,
        finalData,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Solr Response:", response.data);

      await axios.get(`${API.CLIENT_URL}/solr/research/update?commit=true`);
      toast.success("Data submitted and committed successfully.");
      navigate("/user");
    } catch (error) {
      toast.error("Error submitting data.");
      console.error("Error during submission:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="container">
        <h2>Upload Excel File</h2>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        <button onClick={handleSubmit} disabled={loading || !excelData.length}>
          {loading ? "Submitting..." : "Submit to Solr"}
        </button>
        {excelData.length > 0 && (
          <div>
            <h3>Preview Data</h3>
            <table border="1">
              <thead>
                <tr>
                  {Object.keys(excelData[0]).map((key, index) => (
                    <th key={index}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((value, colIndex) => (
                      <td key={colIndex}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelLoad;
