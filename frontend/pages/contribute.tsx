import Footer from '../src/components/Footer'
import NavBar from '../src/components/NavBar'
import { ContributeComponent } from '../src/components/ContributeComponent'
import SideBar from '../src/components/SideBar'
import { useState } from 'react'

const Contribute = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderPage = () => (
    <div>
      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
      <div className="md:pl-64 flex flex-col flex-1" style={{ backgroundColor: ' #FFFDF6' }}>
        <NavBar setSidebarOpen={setSidebarOpen}/>
        <div className="max-w-5xl mx-auto px-2 sm:px-4 md:px-8">
          <ContributeComponent/>
        </div>
        <Footer/>
      </div>
    </div>
  )

  return renderPage()
}

export default Contribute
