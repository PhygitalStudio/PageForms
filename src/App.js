import { useParams } from 'react-router-dom';
import './App.css';
import Form1 from './pages/Form1';
import CryptoJS from 'crypto-js';

function App() {
  const {juego,points} = useParams();
  const secret = "phygitalKey";

  const base64Game = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(juego));
  const decryptedGame = CryptoJS.AES.decrypt(base64Game, secret).toString(CryptoJS.enc.Utf8);
  
  const base64Points = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(points));
  const decryptedPoints = CryptoJS.AES.decrypt(base64Points, secret).toString(CryptoJS.enc.Utf8);


  return (
    <div className="App">
      
     <Form1 juego={decryptedGame} points={decryptedPoints}/>
    </div>
  );
}

export default App;
