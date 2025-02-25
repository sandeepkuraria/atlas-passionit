import React, { useState } from "react";
import Navbar from "../Component/Navbar";
import ReactQuill from "react-quill";
import axios from "axios";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import * as API from "../Endpoint/Endpoint";
import "./Popup.css"; // Add styles for the popup
import ExcelLoad from "../Component/ExcelLoad";
import UploadNewsExcel from "../Component/UploadNewsExcel";

const Dimensions = ({ label, value, onChange }) => (
  <div
    style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}
  >
    <label style={{ fontWeight: "bold", fontSize: "large" }}>{label}:</label>

    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const DimensionInput = ({ label, value, onChange }) => (
  <div className="dimension-input" style={{ marginBottom: "15px" }}>
    <label style={{ fontWeight: "bold", fontSize: "large" }}>{label}:</label>
    <ReactQuill
      value={value}
      onChange={onChange}
      modules={{
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
      }}
      formats={[
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "list",
        "bullet",
        "link",
        "image",
      ]}
      placeholder={`Enter ${label} here...`}
    />
  </div>
);

const AddEditComponent = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Additional fields state
  const [category, setCategory] = useState("");
  const [referenceLink, setReferenceLink] = useState("");
  const [videoRecommendations, setVideoRecommendations] = useState("");
  const [podcastRecommendations, setPodcastRecommendations] = useState("");
  const [undiscoveredInnovation, setUndiscoveredInnovation] = useState("");
  const [researchOpportunities, setResearchOpportunities] = useState("");
  const [patents, setPatents] = useState("");
  const [lessonsToLearn, setLessonsToLearn] = useState("");
  const [startups, setStartups] = useState("");
  const [advertisementGallery, setAdvertisementGallery] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showEntitiesPopup, setShowEntitiesPopup] = useState(false);
  const [showNewsPopup, setShowNewsPopup] = useState(false);
  
  const togglePopup = () => setShowPopup(!showPopup);
  
  const navigate = useNavigate();

  const [passionDimensions, setPassionDimensions] = useState([
    { name: "Probing", description: "" },
    { name: "Innovating", description: "" },
    { name: "Acting", description: "" },
    { name: "Scoping", description: "" },
    { name: "Setting", description: "" },
    { name: "Owning", description: "" },
    { name: "Nurturing", description: "" },
  ]);

  const [prutlDimensions, setPrutlDimensions] = useState({
    positiveSoul: [
      { name: "Peace", description: "" },
      { name: "Respect", description: "" },
      { name: "Unity", description: "" },
      { name: "Trust", description: "" },
      { name: "Love", description: "" },
    ],
    negativeSoul: [
      { name: "Pride", description: "" },
      { name: "Rule", description: "" },
      { name: "Usurp", description: "" },
      { name: "Tempt", description: "" },
      { name: "Lust", description: "" },
    ],
    positiveMaterialism: [
      { name: "Protector", description: "" },
      { name: "Recycling", description: "" },
      { name: "Utility", description: "" },
      { name: "Tangibility", description: "" },
      { name: "Longevity", description: "" },
    ],
    negativeMaterialism: [
      { name: "Possession", description: "" },
      { name: "Rot", description: "" },
      { name: "Utility", description: "" },
      { name: "Trade", description: "" },
      { name: "Lessen", description: "" },
    ],
  });

  const handlePassionChange = (index, value) => {
    const updatedDimensions = [...passionDimensions];
    updatedDimensions[index].description = value;
    setPassionDimensions(updatedDimensions);
  };

  const handlePrutlChange = (type, index, value) => {
    const updatedDimensions = { ...prutlDimensions };
    updatedDimensions[type][index].description = value;
    setPrutlDimensions(updatedDimensions);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const user_id = sessionStorage.getItem("user_id");

    const data = [
      {
        user_id: user_id,
        title,
        description,
        category,
        referenceLink,
        videoRecommendations,
        podcastRecommendations,
        undiscoveredInnovation,
        researchOpportunities,
        patents,
        lessonsToLearn,
        startups,
        advertisementGallery,
        sections: [
          {
            name: "PASSION Dimensions",
            dimensions: passionDimensions.map((dimension) => ({
              dimension: dimension.name,
              content: dimension.description,
            })),
          },
          {
            name: "PRUTL Dimensions",
            subsections: [
              {
                category: "Positive Soul",
                subdimensions: prutlDimensions.positiveSoul.map(
                  (subDimension) => ({
                    subdimension: subDimension.name,
                    content: subDimension.description,
                  })
                ),
              },
              {
                category: "Negative Soul",
                subdimensions: prutlDimensions.negativeSoul.map(
                  (subDimension) => ({
                    subdimension: subDimension.name,
                    content: subDimension.description,
                  })
                ),
              },
              {
                category: "Positive Materialism",
                subdimensions: prutlDimensions.positiveMaterialism.map(
                  (subDimension) => ({
                    subdimension: subDimension.name,
                    content: subDimension.description,
                  })
                ),
              },
              {
                category: "Negative Materialism",
                subdimensions: prutlDimensions.negativeMaterialism.map(
                  (subDimension) => ({
                    subdimension: subDimension.name,
                    content: subDimension.description,
                  })
                ),
              },
            ],
          },
        ],
      },
    ];

    try {
      const response = await axios.post(
        `${API.CLIENT_URL}/solr/research/update/json/docs`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Data submitted successfully:", response.data);

      // Commit the changes in Solr
      await axios.get(`${API.CLIENT_URL}/solr/research/update?commit=true`);
      toast.success("Data submitted and committed successfully.");
      navigate("/user");
    } catch (error) {
      toast.error("Error submitting data.");
      console.error("Error submitting data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        {/* Excel sheet loading component */}
        <div className="flex justify-start">

      <div>
      <button onClick={() => setShowEntitiesPopup(!showEntitiesPopup)} className="my-3 mx-3">Entities</button>
{showEntitiesPopup && (
  <div className="popup-overlay">
    <div className="popup-content">
      <button className="close-button" onClick={() => setShowEntitiesPopup(false)}>&times;</button>
      <ExcelLoad />
    </div>
  </div>
)}
        </div>
      <div>
      <button onClick={() => setShowNewsPopup(!showNewsPopup)} className="my-3 mx-3">News Analytics</button>
{showNewsPopup && (
  <div className="popup-overlay">
    <div className="popup-content">
      <button className="close-button" onClick={() => setShowNewsPopup(false)}>&times;</button>
      <UploadNewsExcel />
    </div>
  </div>
)}
        </div>
        </div>

        <div className="form-container">
          <DimensionInput label="Title" value={title} onChange={setTitle} />
          <DimensionInput
            label="Category"
            value={category}
            onChange={setCategory}
          />
          <DimensionInput
            label="Description"
            value={description}
            onChange={setDescription}
          />

          {/* Additional Fields */}
          <DimensionInput
            label="Reference Link"
            value={referenceLink}
            onChange={setReferenceLink}
          />
          <DimensionInput
            label="Video Recommendations"
            value={videoRecommendations}
            onChange={setVideoRecommendations}
          />
          <DimensionInput
            label="Podcast Recommendations"
            value={podcastRecommendations}
            onChange={setPodcastRecommendations}
          />
          <DimensionInput
            label="Undiscovered Possible Innovation"
            value={undiscoveredInnovation}
            onChange={setUndiscoveredInnovation}
          />
          <DimensionInput
            label="Research Opportunities"
            value={researchOpportunities}
            onChange={setResearchOpportunities}
          />
          <DimensionInput
            label="Patents (if any)"
            value={patents}
            onChange={setPatents}
          />
          <DimensionInput
            label="Lessons to Learn"
            value={lessonsToLearn}
            onChange={setLessonsToLearn}
          />
          <DimensionInput
            label="Startups in this Space"
            value={startups}
            onChange={setStartups}
          />
          <DimensionInput
            label="Advertisement Gallery"
            value={advertisementGallery}
            onChange={setAdvertisementGallery}
          />

          <h3>PASSION Dimensions</h3>
          {passionDimensions.map((dimension, index) => (
            <Dimensions
              key={index}
              label={dimension.name}
              value={dimension.description}
              onChange={(value) => handlePassionChange(index, value)}
            />
          ))}

          <h3>PRUTL Dimensions</h3>
          {[
            "positiveSoul",
            "negativeSoul",
            "positiveMaterialism",
            "negativeMaterialism",
          ].map((type) => (
            <div key={type}>
              <h4>{type.replace(/([A-Z])/g, " $1").toUpperCase()}</h4>
              {prutlDimensions[type].map((subDimension, index) => (
                <Dimensions
                  key={index}
                  label={subDimension.name.toUpperCase()}
                  value={
                    type.includes("positive") || type.includes("negative")
                      ? subDimension.description // This will convert positive/negative content to uppercase
                      : subDimension.description // Keep original case for other types
                  }
                  onChange={(value) => handlePrutlChange(type, index, value)}
                />
              ))}
            </div>
          ))}

          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit to Solr"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEditComponent;
