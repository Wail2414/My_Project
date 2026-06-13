import React from "react";
import { useFormik } from "formik";
import { useAuth } from "../contexts/AuthContext";
import * as Yup from "yup";
import {
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";
import axios from "../axiosConfig";
import { Navigate, useNavigate } from "react-router-dom";

const CreateUser = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      retypePassword: "",
      isAdmin: false,
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string()
        .required("Required")
        .min(6, "Password must be at least 6 characters"),
      retypePassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Required"),
      isAdmin: Yup.boolean(),
    }),
    onSubmit: (values) => {
      axios
        .post("/users/create", values, { withCredentials: true })
        .then((response) => {
          console.log("User created successfully:", response.data);

          navigate("/users");

          //return <Navigate to="/dashboard/users" />;
          // Optionally handle success (e.g., show a success message)
        })
        .catch((error) => {
          console.error("Error creating user:", error);
          // Optionally handle error (e.g., show an error message)
        });
    },
  });
  //ici on sécurise y a que l'admin qui peut créer un user ou un autre admin dans la page createUser.
  if (!user?.isAdmin) {
    return <Typography>You are not authorized to access this page.</Typography>;
  }
  return (
    <form onSubmit={formik.handleSubmit}>
      <Typography variant="h4" gutterBottom>
        Create User
      </Typography>
      <TextField
        id="email"
        name="email"
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        {...formik.getFieldProps("email")}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
      />
      <TextField
        id="password"
        name="password"
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        {...formik.getFieldProps("password")}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
      />
      <TextField
        id="retypePassword"
        name="retypePassword"
        label="Retype Password"
        type="password"
        fullWidth
        margin="normal"
        {...formik.getFieldProps("retypePassword")}
        error={
          formik.touched.retypePassword && Boolean(formik.errors.retypePassword)
        }
        helperText={
          formik.touched.retypePassword && formik.errors.retypePassword
        }
      />
      <FormControlLabel
        control={<Checkbox id="isAdmin" {...formik.getFieldProps("isAdmin")} />}
        label="Is Admin"
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ marginTop: 2 }}
      >
        Submit
      </Button>
    </form>
  );
};

export default CreateUser;
