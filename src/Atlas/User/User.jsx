import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import axios from "axios";
import * as API from "../Endpoint/Endpoint";
import Navbar from "../Component/Navbar";
// import "./Organization.css";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Pagination from "../Component/Pagination";
import NoDataAvailable from "../Component/NoDataAvailable";
import KeyGroupTabs from "../Component/KeyGroupTabs";
const User = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);

        sessionStorage.setItem("user_id", decodedToken.userId);
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);
  const userId = sessionStorage.getItem("user_id");
  useEffect(() => {
    loadData();
  }, [userId]);
  
  const loadData = async () => {
    // try {
    //   const response = await axios.get(API.GET_ORGANIZATION_API(userId));
    //   const sortedData = response.data.sort(
    //     (a, b) => b.organizationid - a.organizationid
    //   );
    //   setData(sortedData);
    // } catch (error) {
    //   console.error("Error loading data:", error);
    // }
  };

  const deleteOrganization = async (organizationid) => {
    // if (window.confirm("Are you sure?")) {
    //   try {
    //     const response = await axios.delete(
    //       API.DELETE_ORGANIZATION_API(organizationid)
    //     );
    //     if (response.status === 200) {
    //       toast.success("Company Deleted Successfully");
    //       loadData();
    //     }
    //   } catch (error) {
    //     if (error.response && error.response.status === 400) {
    //       toast.error("Cannot delete Company as there are associates present.");
    //     } else {
    //       console.error(error);
    //       toast.error("An error occurred while deleting Company.");
    //     }
    //   }
    // }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div>
      <Navbar />
      <div className="mt-4">
        <div className="mb-4 d-flex justify-content-end mr-2">
          <Link to="/data">
            <div className="input-group center">
              <button className="btn btn-round btn-signup">Add Info</button>
            </div>
          </Link>
          <Link to="/fileGenerator">
            <div className="input-group center">
              <button className="btn btn-round btn-signup mx-2 ">Generate</button>
            </div>
          </Link>
        </div>
        <div className="mb-4 d-flex">
        <div className="mr-3">
          <KeyGroupTabs />
        </div>
        <div
          className="table-responsive mb-4 d-flex justify-content-end"
          style={{ margin: "0 auto", maxWidth: "99%" }}
        >
          <table className="table table-bordered table-hover">
            <thead style={{ backgroundColor: "#e37d34", color: "#ffff" }}>
              <tr>
                <th scope="col">No.</th>
                <th scope="col">Title Name</th>
                <th scope="col">Data</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <NoDataAvailable />
              ) : (
                currentItems.map((item, index) => (
                  <tr key={item.organizationid}>
                    <td>{index + indexOfFirstItem + 1}</td>
                    <td>{item.organization}</td>
                    <td>{item.contactname}</td>
                    <td>{item.contactemail}</td>
                    <td>{item.contactphone}</td>
                    <td>
                      <Link to={`/organization/${item.organizationid}`}>
                        <FaEdit size={24} />
                      </Link>

                      <MdDelete
                        size={24}
                        onClick={() => deleteOrganization(item.organizationid)}
                      />
                      <Link
                        to="/projectdetails"
                        state={{
                          organizationName: item.organization,
                          organizationId: item.organizationid,
                        }}
                      >
                        <div>
                          <button className="btn btn-round btn-signup">
                            Project
                          </button>
                        </div>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data.length > 0 && (
          <div className="d-flex justify-content-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={setCurrentPage}
            />
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default User;
