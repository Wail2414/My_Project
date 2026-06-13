import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from '../axiosConfig';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CreateProject = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required('Project name is required')
        .min(3, 'Project name must be at least 3 characters long'),
      description: Yup.string()
        .required('Project description is required')
        .min(10, 'Project description must be at least 10 characters long'),
    }),
    onSubmit: async (values) => {
      try {
        await axios.post('/projects', values, {withCredentials: true});
        navigate('/');
      } catch (error) {
        console.error('Error creating project:', error);
      }
    },
  });

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Create a New Project
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <Box display="flex" flexDirection="column" maxWidth="400px" mx="auto">
          <TextField
            label="Project Name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            margin="normal"
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
          <TextField
            label="Project Description"
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            margin="normal"
            multiline
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />
          <Button variant="contained" color="primary" type="submit">
            Create Project
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CreateProject;
