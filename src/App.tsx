import { useState, useEffect } from "react";
import ManhwaTable, { type Manhwa } from "./components/ManhwaTable";
import { Button } from "./components/ui/button";
import { AddManhwaForm } from "./components/AddManhwaForm";
import { supabase } from "./lib/supabase";

function App() {
  const [addManhwaOpen, setAddManhwaOpen] = useState(false);
  const [manhwaData, setManhwaData] = useState<Manhwa[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchManhwa = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("manhwa")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      setManhwaData(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManhwa();
  }, []);

  return (
    <>
      <section className="min-h-screen bg-background text-foreground p-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-space font-bold">Manhwa Tracker ✦︎</h1>
          <p className="text-muted-foreground">
            Buttons, cards, and tables styled with your custom color tokens.
          </p>
          <Button onClick={() => setAddManhwaOpen(true)}>
            Add Manhwa
          </Button>

          <AddManhwaForm
            open={addManhwaOpen}
            onOpenChange={setAddManhwaOpen}
            onAdded={fetchManhwa} // refresh table after adding
          />
        </div>
        <ManhwaTable
          loading={loading}
          data={manhwaData}
          refresh={fetchManhwa}
        />
      </section>
    </>
  );
}

export default App;
