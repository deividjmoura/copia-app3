import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [nomeDaPasta, setNomeDaPasta] = useState('');
  const [arquivos, setArquivos] = useState([]);

  const handleInputChange = (event) => {
    setNomeDaPasta(event.target.value);
  };

  const handleFileChange = (event) => {
    setArquivos([...event.target.files]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData();

    formData.append('nomeDaPasta', nomeDaPasta);

    for (let i = 0; i < arquivos.length; i++) {
      formData.append('arquivos', arquivos[i]);
    }

    fetch('copia-app3.vercel.app/upload', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.text())
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className="d-flex flex-column align-items-center">
      <img src="/logosistema.png" alt="Logo do sistema" className="my-3" />

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nomeDaPasta">Nome da pasta</label>
          <input
            type="text"
            className="form-control"
            id="nomeDaPasta"
            value={nomeDaPasta}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="arquivos">Arquivos</label>
          <input
            type="file" 
            className="form-control-file" 
            id="arquivos" 
            multiple
            onChange={handleFileChange}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Enviar
        </button>
      </form>
    </div>
  );
}

export default App;
