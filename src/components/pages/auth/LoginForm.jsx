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
  MDBCol
} from 'mdb-react-ui-kit';

import './LoginForm.css'; // Ensure your custom styles are included

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://localhost:7162/api/auth/login', { email, password });

      // Check API response
      console.log(response.data);  // Verify response structure

      // If the response contains token and name, store it in localStorage
      if (response.data && response.data.token && response.data.nom) {
        localStorage.setItem('user', JSON.stringify({
          token: response.data.token,
          nom: response.data.nom,  // Store the user name (not "username")
          userId: response.data.userId,
          email: response.data.email,
          role: response.data.role
        }));

        navigate('/dashboard');
      } else {
        alert('Erreur dans la réponse de l\'API');
      }
    } catch (error) {
      alert('Identifiants invalides');
    }
  };

  const handleRegisterRedirect = () => {
    navigate('/register'); // Redirect to the register page
  };

  return (
    <MDBContainer fluid className='p-0' style={{ height: '100vh', overflow: 'hidden' }}>
      <form onSubmit={handleSubmit}>
        <MDBRow className='g-0 align-items-center h-100'>
          {/* Form Section */}
          <MDBCol md='6' className='d-flex align-items-center justify-content-center'>
            <MDBCard className='w-100 mx-4' style={{ background: 'hsla(0, 0%, 100%, 0.85)', backdropFilter: 'blur(30px)' }}>
              <MDBCardBody className='p-5'>
                <h2 className="fw-bold mb-5 text-center">Connexion</h2>

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

                <MDBBtn type="submit" className='w-100 mb-4' size='md'>Se connecter</MDBBtn>

                <div className="text-center">
                  <p>Ou connectez-vous avec :</p>

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

                {/* Link to Register page */}
                <div className="text-center mt-3">
                  <p>Pas de compte ? <span onClick={handleRegisterRedirect} style={{ color: '#007bff', cursor: 'pointer' }}>S'inscrire ici</span></p>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>

          {/* Image Section (Optional) */}
          <MDBCol md='6' className='d-none d-md-block'>
            <img
              src="/src/assets/images/image1.jpg"  // Replace with your image
              alt="Login"
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}
            />
          </MDBCol>
        </MDBRow>
      </form>
    </MDBContainer>
  );
};

export default LoginForm;
