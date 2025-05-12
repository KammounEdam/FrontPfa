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
            <MDBCard className='w-100 mx-4 auth-card'>
              <MDBCardBody className='p-5'>
                <h2 className="fw-bold mb-5 text-center" style={{ color: '#2c7a7b' }}>Inscription</h2>

                <MDBInput
                  wrapperClass='mb-4 auth-input'
                  label='Nom'
                  id='nom'
                  type='text'
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                />

                <MDBInput
                  wrapperClass='mb-4 auth-input'
                  label='Spécialité'
                  id='specialite'
                  type='text'
                  value={specialite}
                  onChange={(e) => setSpecialite(e.target.value)}
                  required
                />

                <MDBInput
                  wrapperClass='mb-4 auth-input'
                  label='Email'
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <MDBInput
                  wrapperClass='mb-4 auth-input'
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

                <MDBBtn type="submit" className='w-100 mb-4 auth-button' size='md'>S'inscrire</MDBBtn>

                <div className="text-center">
                  <p>Ou inscrivez-vous avec :</p>

                  <MDBBtn tag='a' color='none' className='mx-1' style={{ color: '#2c7a7b' }}>
                    <MDBIcon fab icon='facebook-f' />
                  </MDBBtn>

                  <MDBBtn tag='a' color='none' className='mx-1' style={{ color: '#2c7a7b' }}>
                    <MDBIcon fab icon='twitter' />
                  </MDBBtn>

                  <MDBBtn tag='a' color='none' className='mx-1' style={{ color: '#2c7a7b' }}>
                    <MDBIcon fab icon='google' />
                  </MDBBtn>

                  <MDBBtn tag='a' color='none' className='mx-1' style={{ color: '#2c7a7b' }}>
                    <MDBIcon fab icon='github' />
                  </MDBBtn>
                </div>

                {/* Lien vers la page de connexion */}
                <div className="text-center mt-3">
                  <p>Déjà inscrit ? <span onClick={() => navigate('/login')} className="auth-link">Se connecter ici</span></p>
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
