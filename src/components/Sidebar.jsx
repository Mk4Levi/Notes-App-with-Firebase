export default function Sidebar(props) {
  // Filter notes based on search input
  const filteredNotes = props.notes.filter((note) => {
    const search = props.searchText.toLowerCase();
    return note.body.toLowerCase().includes(search);
  });

  const noteElements = filteredNotes.map((note) => (
    <div key={note.id} className="note-item">
      <div
        className={`title ${note.id === props.currentNote.id ? "selected-note" : ""}`}
        onClick={() => props.setCurrentNoteId(note.id)}
        style={{ display: "flex", flexDirection: "column", width: "100%" }}
      >
        {/* Top row: title + pin/delete */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <h4
            className="text-snippet"
            style={{ flex: 1, marginRight: "8px", overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {note.body.split("\n")[0]}
          </h4>

          <div className="title-buttons" style={{ display: "flex", gap: "5px" }}>
            {/* Pin Button */}
            <button
              className="pin-btn"
              onClick={(e) => {
                e.stopPropagation();
                props.togglePin(note.id);
              }}
            >
              {note.pinned ? "📌" : "📍"}
            </button>

            {/* Delete Button */}
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                props.deleteNote(note.id);
              }}
            >
              <i className="gg-trash trash-icon"></i>
            </button>
          </div>
        </div>

        {/* Last Updated Timestamp */}
        <p
          style={{
            fontSize: "0.75rem",
            color: "#888",
            margin: "2px 5px 0 5px",
            width: "100%",
            textAlign: "right",
          }}
        >
          {note.updatedAt ? new Date(note.updatedAt).toLocaleString() : ""}
        </p>
      </div>
    </div>
  ));

  return (
    <section className="pane sidebar">
      <div
        className="sidebar--header"
        style={{ display: "flex", flexDirection: "column", gap: "5px", padding: "5px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Notes</h3>
          <button className="new-note" onClick={props.newNote}>
            +
          </button>
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search notes..."
          value={props.searchText}
          onChange={(e) => props.setSearchText(e.target.value)}
          style={{
            padding: "4px 6px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            width: "100%",
            boxSizing: "border-box",
          }}
        />
      </div>
      {noteElements}
    </section>
  );
}
