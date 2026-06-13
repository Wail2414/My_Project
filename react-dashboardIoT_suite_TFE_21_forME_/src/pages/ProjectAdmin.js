// AdminPage.js
import React from 'react';
import { useMqtt } from '../contexts/MqttContext';
import AdminTableComponent from '../components/AdminTableComponent';

const ProjectAdmin = () => {
  const { data } = useMqtt();
  return (
    <div>
      <AdminTableComponent/>
    </div>
  );
};

export default ProjectAdmin;
