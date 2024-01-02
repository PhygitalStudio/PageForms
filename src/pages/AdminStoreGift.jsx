import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { SignInContext } from '../hooks/useContext/singInContext';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
// import DatePicker from 'react-native-date-picker';
import ReactDatePicker from 'react-datepicker';

const url = process.env.REACT_APP_URL;
const autorization = process.env.REACT_APP_AUTHORIZATION;

const AdminStoreGift = () => {
  const navigate = useNavigate()

  const {loginKey} = React.useContext(SignInContext)
  

  const [state , setState] = React.useState(0)
  const [checks, setChecks] = React.useState([]);
  const [error, setError] = React.useState(null);
 

  useEffect(() => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${autorization}`);

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

  fetch(url+"/api/checks?populate=tienda", requestOptions)
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
          setChecks(result.data);
        },
        (error) => {
          setError(error);
        }
      )
  }, [])
  return (
    <div className="bg-gray-200 flex justify-center items-center h-screen w-screen">
    <div className=" border-t-8 rounded-sm border-indigo-600 bg-white p-12 pt-16 shadow-2xl w-96 relative h-96 overflow-y-auto ">
      <div className='w-full absolute top-0 left-0'>
        <button onClick={()=>{setState(0)}} className='w-3/6 border-solid border-2 border-slate-200/50 p-2' >Check Code</button>
        <button onClick={()=>{setState(1)}} className='w-3/6 border-solid border-b-2 border-slate-200/50 p-2' >Create Gift</button>
      </div>
      {
        state === 0 ? <CheckGift checks={checks} loginKey={loginKey}/> : <CreateGift checks={checks} loginKey={loginKey}/>
      }
    </div>
  </div>
  )
}

function CheckGift({checks,loginKey}) {
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState(null);
  onchange = (e) => {
    setValue(e.target.value);
    setError(null);
  }
  const onSubmit = (e) => {
    e.preventDefault();
    const cheque = checks.filter(check => {
      return check.attributes.code === value  })[0]
    console.log(cheque);
    if(!cheque?.id) return setError("No existe el cheque");
    if(cheque.attributes.tienda?.data?.attributes.Nombre !== loginKey.user.email) return setError("El cheque no es de esta tienda");
    if(!cheque.attributes.emailEnviado) return setError("El cheque no ha sido enviado");
    if(cheque.attributes.regaloEntregado) return setError("El cheque ya ha sido usado");
    console.log(cheque);

      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${autorization}`);
      myHeaders.append("Content-Type", `application/json`);
  
      const requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: JSON.stringify({data: {"publishedAt": null}}),
        redirect: 'follow'
      };
  
    fetch(url+"/api/checks/"+cheque.id, requestOptions)
        .then(res => res.json())
        .then(
          (result) => {
            console.log(result);
          },
          (error) => {
            setError(error);
          }
        )

  }
  return (
    <div>
       <h1 className="font-bold text-center block text-2xl">Check your code</h1>
      <form className='flex flex-col'>
      <Input id="email" name="email" label="Code to check" placeholder="code" autofocus={true}  onChange={onchange} value={value}/>
     
        <Button value="Submit" onClick={onSubmit}/>
      </form>
    {
      error && 
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-6" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline">{error}</span>
      </div>
    }
    </div>
  )
}

function CreateGift({checks,loginKey}) {
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState(null);
  onchange = (e) => {
    setValue(e.target.value);
    setError(null);
  }


  const initialValues = {
    Regalo: '',
    CantidadCheques: 1,
    Inicio: new Date(),
    Fin: new Date(),
    FinPromo: new Date(),
    Descripcion: "",
  };

  const validationSchema = Yup.object({
    Regalo:  Yup.string().required('El nombre es requerido'),
    CantidadCheques: Yup.number(),
    Inicio:  Yup.date(),
    Fin:  Yup.date().required('La fecha es requerido'),
    FinPromo: Yup.date().required('La fecha es requerido') ,
    Descripcion:  Yup.string(),
  });

  const handleSubmit = (values) => {
    console.log("aaaaa");
    console.log(values);
    const code = values.Regalo.split("")[0] + values.Descripcion.split("")[0] + values.CantidadCheques;
    const data = {"data":{
      "Max":values.CantidadCheques,
      "codigoRegalo":code,
      "Descripcion": values.Descripcion,
      "Fin": values.Fin,
      "FinPromo":values.FinPromo,
      "Inicio":values.Inicio ,
      "Regalo": values.Regalo,
      "genero": values,
      "createdBy":1
  }}
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${autorization}`);
    myHeaders.append("Content-Type", `application/json`);

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(data),
      redirect: 'follow'
    };

  fetch(url+"/api/regalos/", requestOptions)
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
        },
        (error) => {
          setError(error);
        }
      )
  };

  return (
    <div>
    <div>
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form className='formFromik'>
      <div className='inputCreate'>
        <label className="relative  text-gray-500 pointer-events-auto  mt-3" >Nombre Regalo
          <Field type="text" id="Regalo" name="Regalo"  placeholder="Regalo" />
        </label>
      </div>
        <div className='inputCreate'>
        <label className="relative  text-gray-500 pointer-events-auto  mt-3" >CantidadCheques
          <Field type="number" id="CantidadCheques" name="CantidadCheques"  placeholder="Cantidad de Cheques" />
        </label>
        </div>
        <div>
        <label className="relative  text-gray-500 pointer-events-auto  mt-3">Inicio

          <Field name="Inicio">
            {({ field, form }) => (
              <ReactDatePicker
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
          <ErrorMessage name="Inicio" component="div" />
          </label>
        </div>
        <div>
        <label className="relative  text-gray-500 pointer-events-auto  mt-3">Fin
   
          <Field name="Fin">
            {({ field, form }) => (
              <ReactDatePicker
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
          <ErrorMessage name="Fin" component="div" />
          </label>
        </div>
        <div>
          <label className="relative  text-gray-500 pointer-events-auto  mt-3">FinPromo
          <Field name="FinPromo">
            {({ field, form }) => (
              <ReactDatePicker
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
          <ErrorMessage name="FinPromo" component="div" />
          </label>
        </div>
        <div className='inputCreate'>
        <label className="relative  text-gray-500 pointer-events-auto  mt-3" >Descripcion
          <Field type="text" id="Descripcion" name="Descripcion"  placeholder="Descripcion" /> 
        </label>
        </div>

        {/* <div className="selectContainer">
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
        </div> */}

        {
          error && <div className='error'>{error}</div>
        }
        <Button value="submit" type='submit'/>
      </Form>
    </Formik>
    </div>
    </div>
  );
}

function Button({value,onClick,type="button"}) {
  return (
    <button 
      type={type}
      onClick={onClick}
      className="relative  mt-6 transition transition-all block py-3 px-4 w-full text-white font-bold rounded cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-400 hover:from-indigo-700 hover:to-purple-500 focus:bg-indigo-900 transform hover:-translate-y-1 hover:shadow-lg">
      {value}
  </button>
  )
}
function Input({type, id, name, label, placeholder, autofocus,onChange,value}) {
  return (
    <label className="relative  text-gray-500 pointer-events-auto  mt-3">{label}
      <input
        value={value}
        onChange={onChange}
        type={type} 
        id={id} 
        name={name} 
        placeholder={placeholder}
        className="rounded px-4 py-3 w-full mt-1 bg-white text-gray-900 border border-gray-200 focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-100"/>
    </label>
  )
}


export default AdminStoreGift