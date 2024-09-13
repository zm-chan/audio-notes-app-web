import Content from "@/components/Content";
import Sidebar from "@/components/Sidebar";
import SidebarButtonsRow from "@/components/SidebarButtonsRow";
import NoteList from "@/components/NoteList";
import { useSelectedNote } from "@/context/SelectedNoteContext";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import { cn } from "@/lib/utils";

function AppLayout() {
  const { selectedNoteId, selectNote } = useSelectedNote();
  const [toggleSidebar, setToggleSidebar] = useState(false);

  function handleToggleSidebar() {
    setToggleSidebar((prevToggle) => {
      return !prevToggle;
    });
  }

  return (
    <>
      <main className="grid h-screen grid-cols-[auto_auto] sm:grid-cols-[auto_1fr]">
        <Sidebar
          className={cn(
            "xs:-ml-80 xs:w-80 -ml-64 w-64 border-r bg-zinc-900 transition-all duration-300 ease-in-out sm:ml-0 sm:w-80",
            {
              "!ml-0": toggleSidebar,
            },
          )}
        >
          <SidebarButtonsRow selectedNoteId={selectedNoteId} />
          <NoteList selectNote={selectNote} selectedNoteId={selectedNoteId} />
        </Sidebar>
        <Content
          className="w-screen bg-zinc-800 sm:w-auto"
          selectedNoteId={selectedNoteId}
          handleToggleSidebar={handleToggleSidebar}
        />
      </main>
      <Toaster />
    </>
  );
}

export default AppLayout;
