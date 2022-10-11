import Footer from '../src/components/Footer'
import NavBar from '../src/components/NavBar'
import SideBar from '../src/components/SideBar'
import InfoComponent from '../src/components/InfoComponent'
import { useState } from 'react'

const Info = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <div>
        <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
        <div className="md:pl-64 flex flex-col flex-1" style={{ backgroundColor: '#FFFDF6' }}>
          <NavBar setSidebarOpen={setSidebarOpen}/>
          <InfoComponent/>
          <Footer/>
        </div>
      </div>
    </>
  )
}

export default Info
