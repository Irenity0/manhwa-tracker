import ManhwaTable from "./components/ManhwaTable";
import { Button } from "./components/ui/button";

function App() {
  return (
    <>
      <section className="min-h-screen bg-background text-foreground p-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-space fon-bold">Manhwa Tracker ✦︎</h1>
          <p className="text-muted-foreground">
            Buttons, cards, and tables styled with your custom color tokens.
          </p>
          <Button>Add Manhwa</Button>
        </div>
        <ManhwaTable/>
      </section>
    </>
  );
}

export default App;
