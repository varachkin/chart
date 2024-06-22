import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Demo from './Demo'
import { data } from './constants'
import MUIChart from "./MUIChart";
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     {/*<Demo arr={data}/>*/}
        <MUIChart />
    </>
  )
}

export default App
