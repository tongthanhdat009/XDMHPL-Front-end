import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SideBarRow } from './SideBarRow';
const SideBar = () => {
  const { type } = useParams();
  const [activeFilter, setActiveFilter] = React.useState(type);
  const navigate = useNavigate();
  const handleNavigate = (item) => {
    if (item.title == "Profile") {
      navigate(`/profile/3`)
    }
    else {
      navigate(item.path)
    }
  }
  return (
    <div className='max-w-[600px] xl:min-w-[300px]'>
      <SideBarRow activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
    </div>
  )
}

export default SideBar