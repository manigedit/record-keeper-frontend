import apisauce from 'apisauce';

const BASE_URL = 'http://localhost:3000/api/v1/';


const create = (baseURL = BASE_URL) => {

    const api = apisauce.create({
      baseURL,
      timeout: 10000,
    });
  
    
    const createUser = (body) => {
      return api.post('/users', body)
    }

    const getEntries = () => {
      return api.get('/entries');
    }

    const getOldEntriesByUser = (userId) => {
      return api.get(`/entries/${userId}`);
    }

    const createNewEntry = (body) => {
      return api.post('/entries', body);
    }
  
    return {
      // Exporting the list of api functions for use in other modules
      createUser,
      getEntries,
      getOldEntriesByUser,
      createNewEntry,
    };
  };


export default create();
