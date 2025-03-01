import { useState } from "react";
import * as API from "../Endpoint/Endpoint";

const UploadNewsExcel = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

        // Handles file selection
    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setMessage(""); // Clear message when new file is selected
    };

    // Uploads file to backend
    const handleUpload = async () => {
        if (!file) {
            setMessage("Please select an Excel file.");
            return;
        }

        setUploading(true);
        setMessage("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`${API.BASE_URL}upload-excel`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                setMessage("✅ Upload successful: " + result.message);
            } else {
                setMessage("❌ Upload failed: " + result.message);
            }
        } catch (error) {
            setMessage("❌ Error: Unable to upload file");
            console.error("Upload error:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-md">
            <h2 className="text-2xl font-semibold text-center mb-4">Upload Excel File</h2>

            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="border rounded px-3 py-2 w-full mb-4"
            />

            <button
                onClick={handleUpload}
                disabled={uploading}
                className={`w-full py-2 px-4 rounded ${
                    uploading ? "bg-gray-400" : "bg-orange-400 hover:bg-orange-500"
                } text-white font-semibold`}
            >
                {uploading ? "Uploading..." : "Upload"}
            </button>

            {message && (
                <p className={`mt-4 text-center ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                    {message}
                </p>
            )}
        </div>
    );
}

export default UploadNewsExcel