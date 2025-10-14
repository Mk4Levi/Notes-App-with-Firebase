import { useState } from "react";
import ReactMde from "react-mde";
import Showdown from "showdown";

export default function Editor({ tempNoteText, setTempNoteText, darkMode }) {
  const [selectedTab, setSelectedTab] = useState("write");

  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
  });

  return (
    <section className={`pane editor ${darkMode ? "editor-dark" : ""}`}>
      <ReactMde
        value={tempNoteText}
        onChange={setTempNoteText}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={(markdown) => Promise.resolve(converter.makeHtml(markdown))}
        minEditorHeight={100}
        heightUnits="vh"
      />
    </section>
  );
}
