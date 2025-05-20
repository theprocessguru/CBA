import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Helmet } from "react-helmet";

createRoot(document.getElementById("root")!).render(
  <>
    <Helmet>
      <title>Croydon Business Association - Members Directory</title>
      <meta name="description" content="Connecting businesses in Croydon, promoting local commerce, and building a stronger community through our business member directory." />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@400;600;700&display=swap" rel="stylesheet" />
    </Helmet>
    <App />
  </>
);
