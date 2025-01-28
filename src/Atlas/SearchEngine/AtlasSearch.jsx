import React, { useState } from "react";
import "./AtlasSearch.css"; // Assuming you create a CSS file for styles
import Navbar from "../Component/Navbar";
import welcome from "../Images/welcome.png";
import Image from "../Images/homeImage.png";
import * as API from "../Endpoint/Endpoint";

const AtlasSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [loading, setIsLoading] = useState(true);
  const resultListRef = React.useRef(null);

  // const [title, setTitle] = useState("");
  // const [dateModified, setDateModified] = useState(null);
  // const [error, setError] = useState("");
  // const handleSearch = () => {
  //   fetch(
  //     `${API.CLIENT_URL}/solr/research/select?indent=true&q.op=OR&q=${searchQuery}&useParams=`,
  //     //  `https://atlas.passionit.com:8983/solr/research/select?indent=true&q.op=OR&q=${searchQuery}&useParams=`,
  //     {}
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       const fetchedResults = data.response.docs.map((doc, index) => ({
  //         ...doc,
  //         showContent: false,
  //         id: doc.id || index,
  //       }));

  //       setResults(fetchedResults);
  //       setNoResults(fetchedResults.length === 0);

  //       // Scroll to the results list after a short delay
  //       setTimeout(() => {
  //         if (resultListRef.current) {
  //           resultListRef.current.scrollIntoView({ behavior: "smooth" });
  //         }
  //       }, 100);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching search results:", error);
  //       setNoResults(true);
  //     });
  // };

  const handleSearch = () => {
    fetch(
      `${API.CLIENT_URL}/solr/research/select?indent=true&q.op=OR&q=${searchQuery}&useParams=`
      //  `https://atlas.passionit.com:8983/solr/research/select?indent=true&q.op=OR&q=${searchQuery}&useParams=`,
    )
      .then((response) => response.json())
      .then((data) => {
        const fetchedResults = data.response.docs.map((doc, index) => ({
          ...doc,
          showContent: false,
          id: doc.id || index,
        }));

        const fetchDateModifiedPromises = fetchedResults.map((result) => {
          const id = result.id;
          const parsedSrc = JSON.parse(result._src_);
          const title = parsedSrc.title.replace(/<[^>]*>/g, ""); // Removes all HTML tags
          if (id) {
            console.log("Id found++++++++++++++++++", id);
          }

          if (title) {
            return fetch(`${API.BASE_URL}get-date-modified`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ title }),
            })
              .then((res) => res.json())
              .then((dateData) => ({
                ...result,
                dateModified: dateData.dateModified || "Not Found",
              }))
              .catch(() => ({
                ...result,
                dateModified: "Error fetching date",
              }));
          }

          return Promise.resolve({
            ...result,
            dateModified: "No title provided",
          });
        });

        return Promise.all(fetchDateModifiedPromises);
      })
      .then((resultsWithDates) => {
        setResults(resultsWithDates);
        setNoResults(resultsWithDates.length === 0);

        setTimeout(() => {
          if (resultListRef.current) {
            resultListRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
        setNoResults(true);
      })
      .finally(() => {
        setIsLoading(false); // Hide the loading indicator
      });
  };

  const toggleContent = (index) => {
    setResults((prevResults) =>
      prevResults.map((result, i) =>
        i === index ? { ...result, showContent: !result.showContent } : result
      )
    );
  };

  const highlightText = (text, query) => {
    if (!query) return text; // Return the original text if no query
    const regex = new RegExp(`(${query})`, "gi"); // Create a regular expression to match the query
    return text.replace(regex, "<span class='highlight'>$1</span>"); // Wrap matching text with <span>
  };

  return (
    <div>
      <Navbar />
      <header className="header">
        <div className="header_div">
          <div className="vertical-center">
            <img src={welcome} alt="" />
            <h3
              style={{
                color: "#e50000",
                textAlign: "start",
                marginLeft: "15px",
              }}
            >
              The Future of Knowledge, Insight and Innovation
            </h3>
            <div style={{ marginLeft: "15px" }}>
              <input
                className="h-11 mt-1 w-3/5 px-8 pr-3 rounded border-0 focus:outline-none focus:ring-0 shadow-[3px_3px_0_0_#fa713b,-3px_-3px_0_0_#a64b27]"
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  boxShadow: "3px 3px 0 0 #fa713b, -3px -3px 0 0 #a64b27",
                }} // Fallback for unsupported custom shadows
              />
              <button
                className="h-11 ml-2 px-4 rounded bg-[#fa713b] text-white font-bold hover:bg-[#e56733] transition"
                onClick={handleSearch}
              >
                <b>Search</b>
              </button>
            </div>
          </div>
          <div>
            <img
              style={{
                height: "auto",
                width: "500px",
              }}
              src={Image}
              alt="Img"
            />
          </div>
        </div>
      </header>

      {noResults && <div style={{ borderBottom: "2px solid " }}></div>}

      <div style={{ margin: "8px" }}>
        <div id="resultsList" ref={resultListRef}>
          {results.map((result, index) => {
            let jsonData = {};

            // Attempt to parse result._src_ as JSON
            try {
              jsonData = JSON.parse(result._src_); // Parse the string into a JSON object
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }

            return (
              <div className="result_container" key={result.id || index}>
                {/* Title */}
                {/* <h1
                  onClick={() => toggleContent(index)}
                  style={{ cursor: "pointer" }}
                  dangerouslySetInnerHTML={{
                    __html: highlightText(jsonData.title || "", searchQuery),
                  }}
                ></h1> */}

                {/* <h1
  onClick={() => {
    // Remove any HTML tags from the title (e.g., <p>Albert Einstein</p>)
    const strippedTitle = jsonData.title.replace(/<[^>]*>/g, "").trim();

    // Construct the file path using the cleaned title
    const filePath = `/html-pages/${strippedTitle}.html`;

    // Redirect to the corresponding HTML file
    fetch(filePath)
      .then((response) => {
        if (response.ok) {
          window.location.href = filePath;
        } else {
          alert("The page for this title does not exist!");
        }
      })
      .catch(() => {
        alert("Error occurred while navigating to the page.");
      });
  }}
  style={{ cursor: "pointer" }}
  dangerouslySetInnerHTML={{
    __html: highlightText(jsonData.title || "", searchQuery),
  }}
></h1> */}

                <h1
                  onClick={() => {
                    // Clean up the title and create a slug
                    const cleanedTitle = jsonData.title
                      .replace(/^\/\s*/, "")
                      .replace(/<[^>]*>/g, "")
                      .trim()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/\./g, "")
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^\w\-]/g, ""); // Remove special characters

                    // Construct the file path
                    const filePath = `/html-pages/${cleanedTitle}.html`;

                    fetch(filePath)
                      .then((response) => {
                        if (response.ok) {
                          window.location.href = filePath;
                        } else {
                          alert("The page for this title does not exist!");
                        }
                      })
                      .catch(() => {
                        alert("Error occurred while navigating to the page.");
                      });
                  }}
                  style={{
                    cursor: "pointer",
                    textDecoration: "none", // Default text decoration
                    color: "#d62101", // Inherit color from parent styles
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.textDecoration = "underline"; // Add underline on hover
                    e.target.style.color = "#d62101"; // Change color to blue on hover
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.textDecoration = "none"; // Remove underline on hover out
                    e.target.style.color = "#d62101"; // Reset color on hover out
                  }}
                  dangerouslySetInnerHTML={{
                    __html: highlightText(jsonData.title || "", searchQuery),
                  }}
                ></h1>
                <p>
                  <strong>Date : </strong>
                  {result.dateModified || "Not Available"}
                </p>
                <div
                  dangerouslySetInnerHTML={{
                    __html: highlightText(
                      (jsonData.description || "").slice(0, 350) +
                        ((jsonData.description || "").length > 350
                          ? "..."
                          : ""),
                      searchQuery
                    ),
                  }}
                ></div>

                {/* Show content only if showContent is true */}
                {result.showContent && (
                  <div>
                    {/* Description */}
                    {/* <div
                      dangerouslySetInnerHTML={{
                        __html: highlightText(
                          jsonData.description || "",
                          searchQuery
                        ),
                      }}
                    ></div> */}

                    {/* Sections */}
                    {jsonData.sections &&
                      jsonData.sections.map((section, sectionIndex) => (
                        <div key={sectionIndex}>
                          {/* Section Title */}
                          {/* <h2
                            dangerouslySetInnerHTML={{
                              __html: highlightText(
                                section.title || section.name || "",
                                searchQuery
                              ),
                            }}
                          ></h2> */}

                          {/* Dimensions */}

                          {
                            // section.dimensions &&
                            //   section.dimensions.map((dimension, dimIndex) => (
                            //     <div key={dimIndex}>
                            //       <h3
                            //         dangerouslySetInnerHTML={{
                            //           __html: highlightText(
                            //             dimension.name ||
                            //               dimension.dimension ||
                            //               "",
                            //             searchQuery
                            //           ),
                            //         }}
                            //       ></h3>
                            //       <p
                            //         dangerouslySetInnerHTML={{
                            //           __html: highlightText(
                            //             dimension.description ||
                            //               dimension.content ||
                            //               "",
                            //             searchQuery
                            //           ),
                            //         }}
                            //       ></p>
                            //       {/* Sub-Dimensions */}
                            //       {dimension.sub_dimensions &&
                            //         dimension.sub_dimensions.map(
                            //           (subdimension, subdimIndex) => (
                            //             <div key={subdimIndex}>
                            //               <h4
                            //                 dangerouslySetInnerHTML={{
                            //                   __html: highlightText(
                            //                     subdimension.name || "",
                            //                     searchQuery
                            //                   ),
                            //                 }}
                            //               ></h4>
                            //               <p
                            //                 dangerouslySetInnerHTML={{
                            //                   __html: highlightText(
                            //                     subdimension.description || "",
                            //                     searchQuery
                            //                   ),
                            //                 }}
                            //               ></p>
                            //             </div>
                            //           )
                            //         )}
                            //     </div>
                            //   ))
                          }

                          {/* Subsections */}
                          {
                            // section.subsections &&
                            //   section.subsections.map((subsection, subIndex) => (
                            //     <div key={subIndex}>
                            //       <h3
                            //         dangerouslySetInnerHTML={{
                            //           __html: highlightText(
                            //             subsection.category || "",
                            //             searchQuery
                            //           ),
                            //         }}
                            //       ></h3>
                            //       {/* Sub-dimensions for subsections */}
                            //       {subsection.subdimensions &&
                            //         subsection.subdimensions.map(
                            //           (subdimension, subdimIndex) => (
                            //             <div key={subdimIndex}>
                            //               <h4
                            //                 dangerouslySetInnerHTML={{
                            //                   __html: highlightText(
                            //                     subdimension.subdimension || "",
                            //                     searchQuery
                            //                   ),
                            //                 }}
                            //               ></h4>
                            //               <p
                            //                 dangerouslySetInnerHTML={{
                            //                   __html: highlightText(
                            //                     subdimension.content || "",
                            //                     searchQuery
                            //                   ),
                            //                 }}
                            //               ></p>
                            //             </div>
                            //           )
                            //         )}
                            //     </div>
                            //   ))
                          }

                          {/* Domains */}
                          {
                            // section.domains &&
                            //   section.domains.map((domain, domainIndex) => (
                            //     <div key={domainIndex}>
                            //       <h3
                            //         dangerouslySetInnerHTML={{
                            //           __html: highlightText(
                            //             domain.name || "No domain name",
                            //             searchQuery
                            //           ),
                            //         }}
                            //       ></h3>
                            //       <p
                            //         dangerouslySetInnerHTML={{
                            //           __html: highlightText(
                            //             domain.description ||
                            //               "No domain description available.",
                            //             searchQuery
                            //           ),
                            //         }}
                            //       ></p>
                            //     </div>
                            //   ))
                          }

                          {/* Conclusion */}
                          {
                            // section.conclusion && (
                            //   <div>
                            //     <h2>
                            //       <strong>Conclusion:</strong>
                            //     </h2>
                            //     <p
                            //       dangerouslySetInnerHTML={{
                            //         __html: highlightText(
                            //           section.conclusion || "No conclusion.",
                            //           searchQuery
                            //         ),
                            //       }}
                            //     ></p>
                            //   </div>
                            // )
                          }
                        </div>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {noResults && <p className="no-results">No results found.</p>}
      </div>

      {/* <div className="header_div mt-4">
        <div
          className="content-section header_container"
          style={{ lineHeight: 1.8 }}
        >
          <h2 style={{ textAlign: "center" }}>PASSION: The Body’s Drive </h2>
          <div
            style={{
              border: "3px solid #e50000",
              width: "200px",
              borderRadius: "50px",
              textAlign: "center",
              display: "block",
              margin: "0 auto",
            }}
          />
          <p>
            PASSION refers to the deep, internal energy that fuels human action
            and growth, driving individuals to engage with the world and express
            themselves fully. It reflects a dynamic aspect of human nature that
            propels us forward in pursuit of goals, discoveries, and
            accomplishments. PASSION in this context is divided into seven core
            dimensions that capture the various ways in which humans engage with
            life and the world:
          </p>
          <ul>
            <li>
              <strong>Probing:</strong> This dimension of passion relates to
              curiosity and the need to explore. Humans are naturally
              inquisitive, driven by the desire to understand the unknown, dig
              deeper into problems, and ask questions that lead to discovery.
            </li>
            <li>
              <strong>Innovating:</strong> Innovation is the creative aspect of
              passion. It’s the urge to go beyond the status quo, to create new
              ideas, solutions, and approaches that challenge existing norms.
            </li>
            <li>
              <strong>Acting:</strong> Passion is expressed in action. Acting is
              about taking initiative, putting ideas and desires into motion,
              and making tangible changes in the world through effort and
              determination.
            </li>
            <li>
              <strong>Scoping:</strong> T Scoping refers to the ability to see
              the bigger picture. This dimension of passion is about setting
              one’s sights on the broader vision, understanding context, and
              determining the scope of one’s endeavors.
            </li>
            <li>
              <strong>Setting:</strong> Setting defines the strategic aspect of
              passion. It’s about creating plans, establishing frameworks, and
              setting goals to achieve desired outcomes. This requires
              foresight, preparation, and careful thought.
            </li>
            <li>
              <strong>Owning:</strong> Ownership is about taking responsibility
              for one’s actions, choices, and paths. This dimension of passion
              highlights the importance of accountability and commitment to
              one's personal mission.
            </li>
            <li>
              <strong>Nurturing:</strong> Passion also involves caring for and
              cultivating what has been started. Nurturing is the patient and
              loving development of ideas, relationships, or projects, ensuring
              they grow and succeed over time.
            </li>
          </ul>
          <p>
            Together, these seven dimensions make up the PASSION of the body,
            representing the physical and intellectual forces that drive human
            behavior and achievement.
          </p>
        </div>

        <div className="content-section header_container">
          <h2 style={{ textAlign: "center" }}>PRUTL: The Soul’s Compass </h2>
          <div
            style={{
              border: "3px solid #e50000",
              width: "200px",
              borderRadius: "50px",
              textAlign: "center",
              display: "block",
              margin: "0 auto",
            }}
          />
          <p>
            PRUTL reflects the soul’s moral and emotional compass, providing a
            framework for understanding how people relate to others, the world,
            and themselves. PRUTL is split into two categories: Positive Soul
            and Negative Soul, each representing contrasting aspects of the
            human spirit. It helps to define how individuals either elevate or
            degrade their soul through their actions and choices.
          </p>
          <h4>
            <strong>Positive Soul (PRUTL)</strong>
          </h4>{" "}
          The Positive Soul embodies the highest virtues that uplift humanity
          and foster meaningful connections. These virtues are:
          <ul>
            <li>
              <strong>Peace:</strong>Inner calm and harmony, both within oneself
              and in relationships with others. Peace is essential for a
              balanced and centered life.
            </li>
            <li>
              <strong>Respect:</strong>The acknowledgement of the inherent worth
              and dignity of all people. Respect forms the foundation for
              empathy, understanding, and fairness in human interactions.
            </li>
            <li>
              <strong>Unity:</strong>The sense of belonging and connection with
              others. Unity fosters collaboration, cooperation, and a feeling of
              togetherness that transcends individual differences.
            </li>
            <li>
              <strong>Trust:</strong>Trust is about building faith in others and
              oneself. It’s a critical element of all relationships, and it
              supports a stable and secure sense of community.
            </li>
            <li>
              <strong>Love:</strong>The highest form of emotional connection,
              love nurtures, heals, and binds people together. Love is selfless,
              kind, and enduring, and it encompasses compassion and
              understanding for all.
            </li>
          </ul>
          <h4>
            <strong>Negative Soul (PRUTL)</strong>
          </h4>{" "}
          In contrast, the Negative Soul dimensions illustrate the destructive
          aspects of human nature that can erode one’s moral foundation and
          relationships with others:
          <ul>
            <li>
              <strong>Pride:</strong>Excessive self-importance that blinds one
              to the needs or value of others. Pride can lead to arrogance and a
              lack of empathy.
            </li>
            <li>
              <strong>Rule:</strong>The desire for control and dominance over
              others. This aspect of the soul focuses on power and authority
              rather than collaboration and equality.
            </li>
            <li>
              <strong>Usurp:</strong>The act of taking what belongs to others,
              be it power, possessions, or rights. Usurping is a manifestation
              of greed and selfish ambition.
            </li>
            <li>
              <strong>Tempt:</strong>The pull toward desires that may lead to
              unethical behavior. Temptation represents the challenge of staying
              true to one’s values in the face of immediate gratification.
            </li>
            <li>
              <strong>Lust:</strong>An overwhelming desire for physical or
              material pleasures at the expense of deeper emotional and
              spiritual fulfillment. Lust leads to superficial connections and
              discontent.
            </li>
          </ul>
        </div>
      </div>
      <div className="content-section header_container">
        <h2 style={{ textAlign: "center" }}>
          PASSION and PRUTL: The Humanitarian Perspective
        </h2>
        <div
          style={{
            border: "3px solid #e50000",
            width: "200px",
            borderRadius: "50px",
            textAlign: "center",
            display: "block",
            margin: "0 auto",
          }}
        />
        <p>
          By analyzing human actions, behaviors, and even daily interactions
          through the lens of PASSION and PRUTL, we can better understand the
          complex balance between body and soul.
        </p>
        <ul style={{ lineHeight: 1.8 }}>
          <li>
            <strong>PASSION</strong>, representing the body, drives the physical
            and intellectual aspects of existence, urging individuals to act,
            create, and explore.
          </li>
          <li>
            <strong>PRUTL</strong>, representing the soul, governs the moral and
            emotional dimensions, guiding how people relate to one another and
            the world at large.
          </li>
        </ul>
        <p>
          In humanitarian terms, the <strong>positive side of PRUTL</strong>{" "}
          aligns with virtues that promote social harmony, understanding, and
          love, while <strong>PASSION</strong> motivates progress, innovation,
          and personal growth. Both must work in concert for a balanced,
          fulfilling life.
        </p>
        <p>
          However, the negative aspects of PRUTL reveal how the{" "}
          <strong>misalignment of soul </strong> can lead to harmful
          consequences. If driven by lust, pride, or usurpation, even the most
          passionate efforts can be derailed into destructive paths.
          Understanding these dynamics helps provide insight into human
          conflicts, personal dilemmas, and the broader social issues we face.
        </p>
        <p>
          By using PASSION and PRUTL as analytical tools,{" "}
          <strong>Atlas Infopedia </strong>will offer a unique perspective,
          enabling users to explore the ethical and energetic dimensions behind
          everything—from words to celebrities to everyday occurrences—shedding
          light on the deeper humanitarian context that influences our
          collective experience.
        </p>
      </div> */}
    </div>
  );
};

export default AtlasSearch;
