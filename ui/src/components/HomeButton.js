import React from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

export function HomeButton() {
  const history = useHistory();
  return <button
    onClick={() => history.push("/assets")}
    className="mt-5 md:ml-5 text-3xl border border-blue-500 rounded-full px-2 bg-blue-500 text-white "> &lt; </button>;
}
