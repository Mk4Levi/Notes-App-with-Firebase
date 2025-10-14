import { useState, useEffect, useCallback } from "react";
import Split from "react-split";
import { Sidebar, Editor } from "./components";
import { notesCollection, db } from "./firebase";
import {
  addDoc,
  doc,
  deleteDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  collection,
} from "firebase/firestore";


export default function App() {
  const [notes, setNotes] = useState([]);
  const [currentNoteId, setCurrentNoteId] = useState("");
  const [tempNoteText, setTempNoteText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // indicator for saves
  const [darkMode, setDarkMode] = useState(false);
  const [searchText, setSearchText] = useState("");


  const getNotesCollection = useCallback(() => {
    return notesCollection;
  }, []);

  // ---------- FETCH NOTES ----------
  useEffect(() => {
    setLoading(true);
    const q = query(getNotesCollection(), orderBy("updatedAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notesArr = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setNotes(notesArr);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to fetch notes:", error);
        alert("Failed to load notes. Check your connection.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [getNotesCollection]);

  const currentNote = notes.find((note) => note.id === currentNoteId) || notes[0];


  useEffect(() => {
    if (currentNoteId && !notes.find((n) => n.id === currentNoteId)) {
      setCurrentNoteId(notes[0]?.id || "");
    }
  }, [notes, currentNoteId]);


  useEffect(() => {
    if (!currentNoteId && notes.length > 0) setCurrentNoteId(notes[0].id);
  }, [notes, currentNoteId]);

  useEffect(() => {
    if (currentNote) setTempNoteText(currentNote.body);
  }, [currentNote]);


  useEffect(() => {
    if (!currentNote) return;
    const timeoutId = setTimeout(() => {
      if (tempNoteText !== currentNote.body) {
        updateNote(tempNoteText);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [tempNoteText, currentNote]);


  const createNoteInDB = async (note) => {
    return addDoc(getNotesCollection(), note);
  };
  const updateNoteInDB = async (noteId, data) => {
    return setDoc(doc(getNotesCollection(), noteId), data, { merge: true });
  };
  const deleteNoteInDB = async (noteId) => {
    return deleteDoc(doc(getNotesCollection(), noteId));
  };

  // - Prevents creating multiple blank/empty notes and trims whitespace checks.
  const createNewNote = useCallback(async () => {
    const defaultText = "# Type your markdown note's title here";

    if (notes.some((note) => (note.body || "").trim() === "" || note.body === defaultText)) {
      alert("You already have a blank/empty note. Please edit it before creating a new one.");
      return;
    }

    const newNote = {
      body: defaultText,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false,
      tags: [],
    };

    try {
      setSaving(true);
      const newNoteRef = await createNoteInDB(newNote);
      setCurrentNoteId(newNoteRef.id);
    } catch (error) {
      console.error("Failed to create note:", error);
      alert("Failed to create note. Check console for details.");
    } finally {
      setSaving(false);
    }
  }, [notes, createNoteInDB]);


  const updateNote = useCallback(
    async (text) => {
      if (!currentNoteId) return;

      // Prevent saving empty content (trim check)
      if ((text || "").trim() === "") {
        console.warn("Skipped saving empty note.");
        return;
      }

      try {
        setSaving(true);
        await updateNoteInDB(currentNoteId, { body: text, updatedAt: Date.now() });
      } catch (error) {
        console.error("Failed to update note:", error);
        alert("Failed to update note. Check your connection or permissions.");
      } finally {
        setSaving(false);
      }
    },
    [currentNoteId, updateNoteInDB]
  );


  const deleteNote = useCallback(
    async (noteId) => {
      const noteToDelete = notes.find((n) => n.id === noteId);
      // added confirmation before deletion
      const confirmDelete = window.confirm(
        `Are you sure you want to delete "${noteToDelete?.body?.slice(0, 30) || "this note"}"?`
      );
      if (!confirmDelete) return;

      try {
        setSaving(true);
        await deleteNoteInDB(noteId);


        if (noteId === currentNoteId) {
          setCurrentNoteId(notes[0]?.id || "");
        }
      } catch (error) {
        console.error("Failed to delete note:", error);
        alert("Failed to delete note. Try again.");
      } finally {
        setSaving(false);
      }
    },
    [currentNoteId, notes, deleteNoteInDB]
  );

  // ---------- TOGGLE PIN ----------
  const togglePin = useCallback(
    async (noteId) => {
      try {
        setSaving(true);
        const note = notes.find((n) => n.id === noteId);
        if (!note) return;
        await updateNoteInDB(noteId, { pinned: !note.pinned, updatedAt: Date.now() });
      } catch (error) {
        console.error("Failed to toggle pin:", error);
        alert("Failed to pin/unpin. Try again.");
      } finally {
        setSaving(false);
      }
    },
    [notes, updateNoteInDB]
  );


  // create a shallow copy before sorting so original state isn't mutated.
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  // ---------- DARK MODE ----------
  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);


  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (loading) return <div className="loading">Loading notes...</div>;

  return (
    <main>
      { }
      <div className="theme-toggle" style={{ padding: "5px 10px", textAlign: "center" }}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            cursor: "pointer",
            padding: "5px 10px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: darkMode ? "#4a4e74" : "#eee",
            color: darkMode ? "#fff" : "#333",
          }}
        >
          {darkMode ? "Dark Mode" : "Light Mode"}
        </button>
        {/* Loading indicator for save operations */}
        <span style={{ marginLeft: 12 }}>{saving ? "Saving…" : ""}</span>
      </div>

      {notes.length > 0 ? (
        <Split
          sizes={[30, 70]}
          direction={isMobile ? "vertical" : "horizontal"} // improvement for mobile stacking
          className="split"
          minSize={150}
        >
          <Sidebar
            notes={sortedNotes}
            currentNote={currentNote}
            setCurrentNoteId={setCurrentNoteId}
            newNote={createNewNote}
            deleteNote={deleteNote}
            togglePin={togglePin}
            searchText={searchText}
            setSearchText={setSearchText}
          />
          <Editor tempNoteText={tempNoteText} setTempNoteText={setTempNoteText} darkMode={darkMode} />
        </Split>
      ) : (
        <div className="no-notes">
          <h1>You have no notes</h1>
          <button className="first-note" onClick={createNewNote}>
            Create one now
          </button>
        </div>
      )}
    </main>
  );
}
