// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
// import React from "react";
// import EarlyPayment from "./EarlyPayment";

// function App() {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <EarlyPayment />
//     </div>
//   );
// }

// export default App;


import React from "react";
import { Routes, Route } from "react-router-dom";
import EarlyPayment from "./EarlyPayment";
import TimeCalculator from "./TimeCalculator"; // make sure the path is correct

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EarlyPayment />} />
      <Route path="/time-calculator" element={<TimeCalculator />} />
    </Routes>
  );
}
