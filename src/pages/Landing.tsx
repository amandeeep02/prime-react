import { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Artwork } from "../types/Artwork";
import { Paginator } from "primereact/paginator";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { FaChevronDown } from "react-icons/fa";
import "../App.css";

/**
 * Landing Component - Displays a paginated list of artworks.
 */
export default function Landing() {
  // State variables
  const [artworks, setArtworks] = useState<Artwork[]>([]); // List of artworks
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [firstRow, setFirstRow] = useState(0); // Starting row index for pagination
  const [totalRecords, setTotalRecords] = useState(0); // Total number of records available

  const [selectedArtworks, setSelectedArtworks] = useState<
    Map<number, Artwork>
  >(new Map()); // Selected artworks map
  const [showFilter, setShowFilter] = useState(false); // Toggle for filter visibility
  const [rowsToFetch, setRowsToFetch] = useState<number | null>(null); // Number of rows to fetch

  // Fetch artwork data whenever the page changes
  useEffect(() => {
    fetchArtworksByPage(currentPage);
  }, [currentPage]);

  /**
   * Fetch artworks for the given page.
   * @param pageNumber - The current page number to fetch.
   */
  const fetchArtworksByPage = (pageNumber: number) => {
    fetch(`https://api.artic.edu/api/v1/artworks?page=${pageNumber}`)
      .then((response) => response.json())
      .then((data) => {
        setArtworks(data.data);
        setTotalRecords(data.pagination.total);
      });
  };

  /**
   * Fetch additional pages of artworks if needed.
   * @param rowsNeeded - Total rows to fetch.
   * @param currentPage - Current page number.
   */
  const fetchAdditionalPages = async (
    rowsNeeded: number,
    currentPage: number
  ) => {
    let fetchedArtworks = [...artworks];
    let nextPage = currentPage + 1;

    while (
      fetchedArtworks.length < rowsNeeded &&
      nextPage <= totalRecords / 12
    ) {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${nextPage}`
      );
      const data = await response.json();
      fetchedArtworks = fetchedArtworks.concat(data.data);
      nextPage++;
    }

    return fetchedArtworks.slice(0, rowsNeeded);
  };

  /**
   * Handle bulk row selection with filtering.
   */
  const handleRowSelection = async () => {
    if (!rowsToFetch) return;

    let rowsNeeded = rowsToFetch;
    let selectedRows = [...artworks];

    // Fetch additional rows if needed
    if (rowsNeeded > artworks.length) {
      selectedRows = await fetchAdditionalPages(rowsNeeded, currentPage);
    }

    const updatedSelection = new Map(selectedArtworks);
    selectedRows.forEach((artwork) =>
      updatedSelection.set(artwork.id, artwork)
    );

    setSelectedArtworks(updatedSelection);
    setShowFilter(false);
  };

  /**
   * Handle page change event.
   * @param event - Pagination event.
   */
  const handlePageChange = (event: any) => {
    setFirstRow(event.first);
    setCurrentPage(Math.floor(event.first / event.rows) + 1);
  };

  /**
   * Template for the Title column header with filter.
   */
  const renderTitleHeader = () => (
    <div className="flex align-items-center gap-2">
      <span>Title</span>
      <button
        onClick={() => setShowFilter(!showFilter)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#000",
          fontSize: "1rem",
        }}
      >
        <FaChevronDown />
      </button>
      {showFilter && (
        <div className="flex align-items-center gap-2">
          <InputNumber
            value={rowsToFetch}
            onChange={(e) => setRowsToFetch(e.value)}
            min={0}
            max={totalRecords}
            size={5}
          />
          <Button
            label="Submit"
            onClick={handleRowSelection}
            className="p-button-sm"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="card">
      {/* Data Table Component */}
      <DataTable
        value={artworks}
        rows={12}
        totalRecords={totalRecords}
        first={firstRow}
        onPage={handlePageChange}
        tableStyle={{ minWidth: "50rem", border: "1px solid #000" }}
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        selectionMode="checkbox"
        selection={Array.from(selectedArtworks.values())}
        onSelectionChange={(e) => {
          const newSelectedMap = new Map<number, Artwork>();
          e.value.forEach((artwork: Artwork) =>
            newSelectedMap.set(artwork.id, artwork)
          );
          setSelectedArtworks(newSelectedMap);
        }}
        dataKey="id"
      >
        {/* Columns */}
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3em" }}
        ></Column>
        <Column
          field="title"
          header={renderTitleHeader}
          style={{ width: "16.6%" }}
        ></Column>
        <Column
          field="place_of_origin"
          header="Place of Origin"
          style={{ width: "16.6%" }}
        ></Column>
        <Column
          field="artist_display"
          header="Artist"
          style={{ width: "16.6%" }}
        ></Column>
        <Column
          field="inscriptions"
          header="Inscriptions"
          style={{ width: "16.6%" }}
        ></Column>
        <Column
          field="date_start"
          header="Start Date"
          style={{ width: "16.6%" }}
        ></Column>
        <Column
          field="date_end"
          header="End Date"
          style={{ width: "16.6%" }}
        ></Column>
      </DataTable>

      {/* Paginator Component */}
      <div className="card">
        <Paginator
          first={firstRow}
          rows={12}
          totalRecords={totalRecords}
          onPageChange={handlePageChange}
          template="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        />
      </div>
    </div>
  );
}
