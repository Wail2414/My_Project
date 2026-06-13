import React, { useEffect, useMemo, useState } from 'react';
import axios from "../axiosConfig";
import { useMqtt } from '../contexts/MqttContext';
import { useParams } from 'react-router-dom';
import './AdminTableComponent.css';
const AdminTableComponent = () => {
  const [projectData, setProjectData] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const {projectid} = useParams();
  const { data } = useMqtt();
  // Fetch initial data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`/projects/${projectid}/data`,{topics:Object.keys(data)});
        setProjectData(response.data);
        console.log(data,response.data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchData();
  }, []);
  const handleRowClick = (rowId) => {
    setExpandedRow(rowId === expandedRow ? null : rowId);
  };

  const handleUpdateLimits = async (rowId, newMinLimit, newMaxLimit, topicName) => {
    try {
      // Update local state with new values
      setProjectData(prevData =>
        prevData.map(item =>
          item.id === rowId ? { ...item, data: { ...item.data, minLimit: newMinLimit, maxLimit: newMaxLimit } } : item
        )
      );
      const response = await axios.put(`/api/projects/${projectid}/data`, {
        minLimit: newMinLimit,
        maxLimit: newMaxLimit,
        topicName: topicName,
      });

      
    } catch (error) {
      console.error('Error updating limits:', error);
    }
  };

  return (
    <div className="table-container">
      <div className="table-header">
        <div className="table-row">
          <div className="table-cell">Topic Name</div>
          <div className="table-cell">Min Limit</div>
          <div className="table-cell">Max Limit</div>
        </div>
      </div>
      <div className="table-body">
        {Array.isArray(projectData) && projectData.data.map((row, index) => (
          <div key={row.id} className="table-row">
            <div className="table-cell" onClick={() => handleRowClick(row.id)}>
              {row.data.topicName}
            </div>
            <div className="table-cell">{row.data.minLimit}</div>
            <div className="table-cell">{row.data.maxLimit}</div>
            {expandedRow === row.id && (
              <ExpandedComponent
                data={row.data}
                onUpdate={handleUpdateLimits}
                rowId={row.id}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ExpandedComponent = ({ data, onUpdate, rowId }) => {
  const [minLimit, setMinLimit] = useState(data.minLimit);
  const [maxLimit, setMaxLimit] = useState(data.maxLimit);

  const handleSave = () => {
    onUpdate(rowId, minLimit, maxLimit, data.topicName);
  };

  return (
    <div className="expanded-row">
      <div className="expanded-cell">
        <label>
          Min Limit:
          <input
            type="number"
            value={minLimit}
            onChange={(e) => setMinLimit(parseInt(e.target.value, 10))}
          />
        </label>
      </div>
      <div className="expanded-cell">
        <label>
          Max Limit:
          <input
            type="number"
            value={maxLimit}
            onChange={(e) => setMaxLimit(parseInt(e.target.value, 10))}
          />
        </label>
      </div>
      <div className="expanded-cell">
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default AdminTableComponent;