import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBIcon,
  MDBRow,
  MDBCol,
  MDBCheckbox
} from 'mdb-react-ui-kit';

const RegisterForm = () => {
  const [nom, setNom] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://localhost:7162/api/auth/register', {
        nom,
        specialite,
        email,
        password
      });
      navigate('/login');
    } catch (error) {
      alert("Erreur d'inscription");
    }
  };

  return (
    <MDBContainer fluid className='p-0' style={{ height: '100vh', overflow: 'hidden' }}>
      <form onSubmit={handleSubmit}>
        <MDBRow className='g-0 align-items-center h-100'>

          {/* Form Section */}
          <MDBCol md='6' className='d-flex align-items-center justify-content-center'>
            <MDBCard className='w-100 mx-4' style={{ background: 'hsla(0, 0%, 100%, 0.85)', backdropFilter: 'blur(30px)' }}>
              <MDBCardBody className='p-5'>
                <h2 className="fw-bold mb-5 text-center">Inscription</h2>

                <MDBInput
                  wrapperClass='mb-4'
                  label='Nom'
                  id='nom'
                  type='text'
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                />

                <MDBInput
                  wrapperClass='mb-4'
                  label='Spécialité'
                  id='specialite'
                  type='text'
                  value={specialite}
                  onChange={(e) => setSpecialite(e.target.value)}
                  required
                />

                <MDBInput
                  wrapperClass='mb-4'
                  label='Email'
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <MDBInput
                  wrapperClass='mb-4'
                  label='Mot de passe'
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <div className='d-flex justify-content-start mb-4'>
                  <MDBCheckbox name='newsletter' id='newsletter' label="S'abonner à la newsletter" />
                </div>

                <MDBBtn type="submit" className='w-100 mb-4' size='md'>S'inscrire</MDBBtn>

                <div className="text-center">
                  <p>Ou inscrivez-vous avec :</p>

                  <MDBBtn tag='a' color='none' className='mx-1' style={{ color: '#3b5998' }}>
                    <MDBIcon fab icon='facebook-f' />
                  </MDBBtn>

                  <MDBBtn tag='a' color='none' className='mx-1' style={{ color: '#55acee' }}>
                    <MDBIcon fab icon='twitter' />
                  </MDBBtn>

                  <MDBBtn tag='a' color='none' className='mx-1' style={{ color: '#dd4b39' }}>
                    <MDBIcon fab icon='google' />
                  </MDBBtn>

                  <MDBBtn tag='a' color='none' className='mx-1' style={{ color: '#333333' }}>
                    <MDBIcon fab icon='github' />
                  </MDBBtn>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>

          {/* Image Section */}
          <MDBCol md='6' className='d-none d-md-block'>
            <img
              src="/src/assets/images/image1.jpg"
              alt="Inscription"
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}
            />
          </MDBCol>
        </MDBRow>
      </form>
    </MDBContainer>
  );
};

export default RegisterForm;
