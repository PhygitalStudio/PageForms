import React, { useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Input from '../components/Input/Input';
import PhoneInputField from '../components/phoneInput/PhoneInput';
import { redirect, useNavigate } from 'react-router-dom';
import { findEmail, postUser, postPointGame } from '../utils/functionsFetch';



const Form1 = ({juego="",points=0}) => {
  const navigate = useNavigate()

  const [error, setError] = React.useState(null);
  
  const [required, setRequired] = React.useState({});
  
  
  

  // const url = process.env.REACT_APP_URL;
  const url = "http://localhost:1337/api";
  const autorization = process.env.REACT_APP_AUTHORIZATION;

  var myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${autorization}`);

  useEffect(() => {
    fetch(url+"/form-users?populate=Logo",{headers: myHeaders})
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result.data[0].attributes);
          setRequired( result.data[0].attributes)
        },
        (error) => {
          setError(error);
        }
      )
  }, [])

  const initialValues = {
    Nombre: '',
    Apellido: '',
    Email: '',
    birthday: '',
    genero: '',
    phoneNumber: '',
  };

  const validationSchema = Yup.object({
    Nombre: required?.NameObligatorio ? Yup.string().required('El nombre es requerido'): Yup.string(),
    Apellido: required?.ApellidoObligatorio ? Yup.string().required('El apellido es requerido'): Yup.string(),
    Email:  Yup.string().required('El email es requerido').email('Email invalido'),
    birthday: required?.NacimientoObligatorio ? Yup.date(): Yup.date(),
    genero: required?.GeneroObligatorio ? Yup.string().required('El genero es requerido') : Yup.string(),
    phoneNumber: required?.TelefonoObligatorio ? Yup.number().required('El numero de telefono es requerido'): Yup.number(),
  });

  const handleSubmit = async(values) => {
    // Handle form submission
    let userDB = await findEmail(values.Email);
    if(userDB === undefined) {
      userDB = await postUser(values.Nombre,values.Apellido,values.Email,values.birthday,values.genero,values.phoneNumber);
      console.log(userDB);
    } 
    await postPointGame(userDB.id,points,juego);
    navigate('/register/gracias');
  };

  return (
    <div>
   {
    required &&
    
    <div>
    {required?.Logo?.data && <img src={'http://localhost:1337'+required.Logo.data.attributes.formats.thumbnail.url} width={200} />}
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form className='formFromik'>
        <Input nameInput="Nombre" />
        <Input nameInput="Apellido" />
        <Input nameInput="Email" type='email' />
        <div>
          {/* Utilizando react-datepicker */}
          <Field name="birthday">
            {({ field, form }) => (
              <DatePicker
                {...field}
                selected={field.value}
                onChange={(date) => form.setFieldValue(field.name, date)}
                dateFormat="dd/MM/yyyy"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                placeholderText="Selecciona la fecha de nacimiento"
              />
            )}
          </Field>
          <ErrorMessage name="birthday" component="div" />
        </div>

        <div className="selectContainer">
          <Field  
                  as="select" 
                  id={"genero"} 
                  name={"genero"} 

              >
                <option value="">Genero</option>
                <option value="Hombre">Hombre</option>
                <option value="Mujer">Mujer</option>
                <option value="Otros">Otro</option>
          </Field>
          <ErrorMessage name={"genero"} component="div" className='error' />
        </div>
        <Field
          name="phoneNumber" // Asegúrate de que coincide con el nombre del campo en PhoneInputField
          component={PhoneInputField}
          country="US" // Puedes ajustar el país según tus necesidades
          onChange={(phoneNumber) => {}}
        />
        {
          error && <div className='error'>{error}</div>
        }
        <button className='buttonSubmit' type="submit">Submit</button>
      </Form>
    </Formik>
    </div>
  }
    </div>
  );
};

export default Form1;


